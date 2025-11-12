import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie, Actor, Cast, Award } from "./types";

type Entity = Movie | Actor | Cast | Award;
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
 },
 };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
 });
};
