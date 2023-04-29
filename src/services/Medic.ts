import * as bcrypt from 'bcryptjs'

import { Database } from "@/database"

import { User } from "@/models/User"
import { Medic } from "@/models/Medic"
import config from "@/config"

interface CreateMedicParams {
  name: string
  login: string
  email: string
  password: string
  crm: string
}

export class MedicService {
  constructor(
    private readonly userRepository = Database.getRepository(User),
    private readonly medicRepository = Database.getRepository(Medic)
  ) {}

  async getAllMedics() {
    const medics = await this.medicRepository.find({ 
      relations: ['user']
    })

    return { success: true, data: medics }
  }

  async createMedic(params: CreateMedicParams) {
    const loginAlreadyInUse = await this.userRepository.findOneBy({
      login: params.login
    })

    if (loginAlreadyInUse) {
      return {
        success: false,
        error: "O login informado já está cadastrado."
      }
    }

    const emailAlreadyInUse = await this.userRepository.findOneBy({
      email: params.email
    })

    if (emailAlreadyInUse) {
      return {
        success: false,
        error: "O e-mail informado já está cadastrado."
      }
    }

    const crmAlreadyRegistered = await this.medicRepository.findOneBy({
      crm: params.crm
    })

    if (crmAlreadyRegistered) {
      return {
        success: false,
        error: "CRM informado já está cadastrado."
      }
    }

    const user = new User()
    user.email = params.email
    user.login = params.login
    user.password = await bcrypt.hash(params.password, config.user.passwordSalt)
    user.type = 'medic'
    user.name = params.name

    const medic = new Medic()
    medic.crm = params.crm
    medic.user = user

    await this.medicRepository.save(medic)

    return { success: true, data: user }
  }
}
