import { EditFields, GeneralQuestion, GeneralQuestionOption } from "../../models/model";
import { QuestionTypes } from "../constants/question-types";

export function getJSONToUpdate (editFormatData: EditFields[], updatedData: any) {
  const jsonToUpdate = editFormatData?.filter((field: any) => {
    return !["modified_ts", "created_ts"].includes(field?.field_name);
  });
  const updatedJson = jsonToUpdate.map(field => {
    const { field_name, field_type, ...rest } = field;
    return {
      field_name,
      field_type,
      ...rest,
      field_value: updatedData?.[field_name]
    }
  });
  return updatedJson;
}

export function getJSONFormatOptions (question: GeneralQuestion) {
  const { general_question_options: options } = question || {};
  if (!options?.length || (options as any)[0] === "") {
    return [{
      id: -1,
      general_question_id: question.id,
      content: "",
      is_correct: question.type === QuestionTypes.GENERAL ? 1 : 0
    }];
  }
  return options.map(option => option ? JSON.parse(option as any) : option);
}