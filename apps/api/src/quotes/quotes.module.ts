// apps/api/src/quotes/quotes.module.ts
import { Module }           from '@nestjs/common'
import { QuotesController } from './quotes.controller'
import { QuotesService }    from './quotes.service'
import { EmailModule }      from '../email/email.module'
import { StorageModule }    from '../storage/storage.module'

@Module({
  imports:     [EmailModule, StorageModule],
  controllers: [QuotesController],
  providers:   [QuotesService],
  exports:     [QuotesService],
})
export class QuotesModule {}
