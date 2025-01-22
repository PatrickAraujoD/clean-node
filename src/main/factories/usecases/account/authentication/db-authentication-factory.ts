import env from '@/main/config/env'
import { DbAuthentication } from '@/data/usecases/account/authentication/db-authentication'
import { Authentication } from '@/domain/usecases/account/authentication'
import { BcryptAdapter } from '@/infra/criptography/bcrypt-adapter/bcrypt-adapter'
import { JwtAdapter } from '@/infra/criptography/jwt-adapter/jwt-adapter'
import { AccountMongoRepository } from '@/infra/db/mongodb/account/account-mongo-repository'

export const makeDbAuthentication = (): Authentication => {
  const salt = 12
  const accountMongoRepository = new AccountMongoRepository()
  const hashComparer = new BcryptAdapter(salt)
  const encrypter = new JwtAdapter(env.jwtSecret)
  return new DbAuthentication(accountMongoRepository, hashComparer, encrypter, accountMongoRepository)
}