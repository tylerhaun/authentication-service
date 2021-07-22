const _ = require("lodash");
const Joi = require("joi");
const moment = require("moment");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const db = require("../models")

//import AbstractController from "./AbstractController";
import VerifiableController from "./VerifiableController";
import HttpError from "../http-errors";


class TotpController extends VerifiableController {

  _getModel() {
    return db.Totp;
  }


  async create(data) {
    this.logger.log({});
    const schema = Joi.object({
      userId: Joi.string().required(),
      //code: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const secret = speakeasy.generateSecret();

    const totpCreateData = {
      code: secret.ascii,
      userId: validated.userId,
    };
    const createdTotp = await super.create(totpCreateData);
    return _.omit(createdTotp, ["code"]);

  }


  async startVerification(query, data) {
    this.logger.log({method: "startVerification", query});
    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required(),
      }),
      data: Joi.object({
        userId: Joi.string().required(),
      })
    });
    const validated = Joi.attempt({query, data}, schema);

    const totp = await this.findOne({
      id: validated.query.id,
      userId: validated.data.userId,
      verifiedAt: null,
    });

    const otpAuthUrl = speakeasy.otpauthURL({
      secret: totp.code,
      label: "authentication service" //TODO make configurable
    });

    const imageUrl = this.generateQrCode({otpAuthUrl});

    return {imageUrl};
  
  }


  async generateQrCode(data) {
    this.logger.log({method: "generateQrCode", data});
    const schema = Joi.object({
      otpAuthUrl: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const dataUrl = await new Promise(function(resolve, reject) {
      if (true) { // TODO add flag for test mode
        QRCode.toString(validated.otpAuthUrl, {type: "terminal"}, function (err, codeString) {console.log(codeString)})
      }
      QRCode.toDataURL(validated.otpAuthUrl, function (error, url) {
        console.log(url)
        if (error) {
          return reject(error);
        }
        return resolve(url);
      })
    })

    return dataUrl;

  }


  async verify(query, data) {
    this.logger.log({method: "verify", query, data})
    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required()
      }),
      data: Joi.object({
        code: Joi.string().required(),
        userId: Joi.string().required(),
      }),
    });
    const validated = Joi.attempt({query, data}, schema);
    console.log("validated", validated);

    const totp = await this.findOne({
      id: validated.query.id,
      userId: validated.data.userId
    });
    console.log("totp", totp);
    const verifyData = {
      secret: totp.code,
      token: validated.data.code
    };
    console.log("verifyData", verifyData);
    const result = speakeasy.totp.verify(verifyData)
    console.log("result", result);
    if (!result) {
      throw new HttpError({message: "Bad token", status: 401})
    }

    await this._removeExistingTotp({userId: validated.data.userId});
    const updateResult = await this.update({id: totp.id}, {verifiedAt: moment()})
    console.log("updateResult", updateResult);

    const updatedTotp = await this.findOne({id: totp.id});
    return updatedTotp;

  }


  async _removeExistingTotp(query) {
    this.logger.log({method: "_removeExistingTotp", query})
    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const existingTotp = await this.findOne({
      userId: validated.userId,
      verifiedAt: {
        [Symbol.for("ne")]: null,
      },
    }, {plain: false, skipError: true})
    if (!existingTotp) {
      return;
    }
    console.log("existingTotp", existingTotp);
    console.log(existingTotp.delete);
    console.log(existingTotp.destroy);
    const deleteResult = await this.delete({id: existingTotp.id})
    console.log({deleteResult})
  
  }

}


export default TotpController;

