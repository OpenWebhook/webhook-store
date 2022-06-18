import { ArgsType, Field } from '@nestjs/graphql';
import { PaginationArgs } from './pagination';

@ArgsType()
export class WebhooksQueryArgs extends PaginationArgs {
  @Field(() => String, { nullable: true })
  path?: string;
}
