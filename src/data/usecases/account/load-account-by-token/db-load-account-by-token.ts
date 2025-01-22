import { LoadAccountByTokenRepository, AccountModel, Decrypter, LoadAccountByToken } from "./db-load-account-by-token-protocols";

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor(
    private readonly decrypter: Decrypter,
    private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
  ){}

  async load (acessToken: string, role?: string): Promise<AccountModel> {
    const token = await this.decrypter.decrypt(acessToken)
    if (token) {
      const account = await this.loadAccountByTokenRepository.loadByToken(acessToken, role)
      if (account) {
        return account
      }
    }
    return null
  }
}