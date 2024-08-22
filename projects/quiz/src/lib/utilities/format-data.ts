import { EditFields } from "../../models/model";

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