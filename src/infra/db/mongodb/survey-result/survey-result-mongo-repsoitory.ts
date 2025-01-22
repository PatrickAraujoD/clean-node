import { SaveSurveyResultModel, SaveSurveyResultRepository, SurveyResultModel } from "@/data/usecases/save-result/save-survey-result/save-survey-result-protocols";
import { MongoHelper } from "../helpers/mongo-helper";

export class SurveyResultMongoRepository implements SaveSurveyResultRepository {
  async save(data: SaveSurveyResultModel): Promise<SurveyResultModel> {
    const surveyResultsCollection = await MongoHelper.getCollection('surveyResults')
    const surveyResult = await surveyResultsCollection.findOneAndUpdate({
      surveyId: data.surveyId,
      accountId: data.accountId
    }, {
      $set: {
        answer: data.answer,
        date: data.date
      }
    }, {
      upsert: true,
      returnDocument: 'after'
    })
    return MongoHelper.map(surveyResult)
  }
}