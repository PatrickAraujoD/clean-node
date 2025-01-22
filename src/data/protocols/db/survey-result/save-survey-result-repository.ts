import { SurveyModel } from "@/domain/models/survey";
import { SurveyResultModel } from "@/domain/models/survey-result";
import { SaveSurveyResult, SaveSurveyResultModel } from "@/domain/usecases/survey-result/save-survey-result";

export interface SaveSurveyResultRepository {
  save (data: SaveSurveyResultModel): Promise<SurveyResultModel>
}