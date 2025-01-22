import { Collection } from "mongodb";
import { MongoHelper } from "../helpers/mongo-helper";
import { SurveyModel } from "@/domain/models/survey";
import { AccountModel } from "@/domain/models/account";
import { SurveyResultMongoRepository } from "./survey-result-mongo-repsoitory";

let surveyCollection: Collection;
let surveyResultCollection: Collection;
let accountCollection: Collection;

const makeSut = (): SurveyResultMongoRepository => {
  return new SurveyResultMongoRepository()
}

const makeSurvey = async (): Promise<SurveyModel> => {
  const surveyDocument = await surveyCollection.insertOne({
    question: 'any_question', 
    answers: [{
      answer: 'any_answer',
      image: 'any_image'
    }, {
      answer: 'other_answer'
    }],
    date: new Date()
  })
  const survey = await surveyCollection.findOne({ _id: surveyDocument.insertedId });
  return MongoHelper.map(survey)
}

const makeAccount = async (): Promise<AccountModel> => {
  const accountDocument = await accountCollection.insertOne({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    accessToken: 'any_token'
  })
  const account = await accountCollection.findOne({ _id: accountDocument.insertedId });
  return MongoHelper.map(account)
}

describe('SurveyResult Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})
  })

  describe('save()', () => {
    test("Should update survey result if its not new", async () => {
      const sut = makeSut()
      const survey = await makeSurvey()
      const account = await makeAccount()
      const res = await surveyResultCollection.insertOne({
        surveyId: survey.id,
        accountId: account.id,
        answer: survey.answers[0].answer,
        date: new Date()
      })
      const surveyResultById = await surveyResultCollection.findOne({
        _id: res.insertedId
      })
      const surveyResult = await sut.save({
        surveyId: survey.id,
        accountId: account.id,
        answer: survey.answers[1].answer,
        date: new Date()
      })
      expect(surveyResult).toBeTruthy()
      expect(surveyResult.id).toBeTruthy()
      expect(surveyResultById._id).toEqual(surveyResult.id)
      expect(surveyResult.answer).toBe(survey.answers[1].answer)
    })

    test("Should save a survey result if its new", async () => {
      const sut = makeSut()
      const survey = await makeSurvey()
      const account = await makeAccount()
      const surveyResult = await sut.save({
        surveyId: survey.id,
        accountId: account.id,
        answer: survey.answers[0].answer,
        date: new Date()
      })
      expect(surveyResult).toBeTruthy()
      expect(surveyResult.id).toBeTruthy()
      expect(surveyResult.answer).toBe(survey.answers[0].answer)
    })
  })

})