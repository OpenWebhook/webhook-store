import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Response } from '@prisma/client';

@ObjectType()
export class ResponseModel implements Partial<Response> {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  webhookId!: string;
}
