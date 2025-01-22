import { 
  AccountModel,  
  AuthenticationModel, 
  HashComparer, 
  LoadAccountByEmailRepository, 
  Encrypter, 
  UpdateAccessTokenRepository 
} from "./db-authentication-protocols";
import { DbAuthentication } from "./db-authentication";

const makeFakeAccount = (): AccountModel => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'hashed_password'
})

type SutTypes = {
  sut: DbAuthentication,
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository,
  hashComparer: HashComparer,
  encrypterStub: Encrypter,
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository()
  const hashComparer = makeHashComparer()
  const encrypterStub = makeEncrypter()
  const sut = new DbAuthentication(
    loadAccountByEmailRepositoryStub,
    hashComparer,
    encrypterStub,
    updateAccessTokenRepositoryStub
  )
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashComparer,
    encrypterStub,
    updateAccessTokenRepositoryStub
  }
}

const makeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
  class UpdateAcessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAcessToken (id: string, token: string): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }
  return new UpdateAcessTokenRepositoryStub()
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      const account = makeFakeAccount()
      return new Promise(resolve => resolve(account))
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (id: string): Promise<string> {
      return new Promise(resolve => resolve('any_token'))
    }
  }
  return new EncrypterStub()
} 

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }
  return new HashComparerStub()
}

const makeAuthenticationModel = (): AuthenticationModel => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})

describe('DbAuthentication UseCase', () => {
  test("Should call LoadAccountByEmailRepository with correct email", async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.auth(makeAuthenticationModel())
    expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test("Should throw if LoadAccountByEmailRepository throws", async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test("Should return null if LoadAccountByEmailRepository returns null", async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValue(null)
    const acessToken = await sut.auth(makeAuthenticationModel())
    expect(acessToken).toBeNull()
  })

  test("Should call HashComparer with correct values", async () => {
    const { sut, hashComparer } = makeSut()
    const compareSpy = jest.spyOn(hashComparer, 'compare').mockReturnValue(null)
    await sut.auth(makeAuthenticationModel())
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password' )
  })

  test("Should throw if HashComparer throws", async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test("Should return null if HashComparer returns false", async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockReturnValue(new Promise(resolve => resolve(false)))
    const acessToken = await sut.auth(makeAuthenticationModel())
    expect(acessToken).toBeNull()
  })

  test("Should call Encrypter with correct id", async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt').mockReturnValue(null)
    await sut.auth(makeAuthenticationModel())
    expect(encryptSpy).toHaveBeenCalledWith('any_id')
  })

  test("Should throw if Encrypter throws", async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test("Should returns a token on sucess", async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth(makeAuthenticationModel())
    expect(accessToken).toBe('any_token')
  })

  test("Should call Encrypter with correct id", async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt').mockReturnValue(null)
    await sut.auth(makeAuthenticationModel())
    expect(encryptSpy).toHaveBeenCalledWith('any_id')
  })

  test("Should call UpdateAcessTokenRepository with correct values", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAcessToken')
    await sut.auth(makeAuthenticationModel())
    expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
  })

  test("Should throw if UpdateAcessTokenRepository throws", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    jest.spyOn(updateAccessTokenRepositoryStub, 'updateAcessToken').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })
})