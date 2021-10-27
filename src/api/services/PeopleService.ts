/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import moment from 'moment';
import { PersonCreateModel } from '@models/PersonCreateModel';
import PeopleRepository from '@repositories/PeopleRepository';
import InvalidField from '@errors/InvalidField';
import { PersonSearch } from '@models/PersonSearch';
import NotFound from '@errors/NotFound';
import PersonPatchModel from '@models/PersonPatchModel';

class PeopleService {
  async create(payload: PersonCreateModel): Promise<PersonPatchModel> {
    this.isOlder(payload.data_nascimento);
    const person = await PeopleRepository.create(payload) as PersonPatchModel;
    person.senha = undefined;
    // person.data_nascimento = this.toFormatedDate(person.data_nascimento as string);
    return person;
  }

  toFormatedDate(date:string) {
    const temp = moment(date).format(
      'DD/MM/YYYY',
    );
    return temp.toString();
  }

  isOlder(date: string) {
    const birthday = moment(date, 'DD/MM/YYYY').format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const age = moment().diff(birthday, 'years', false);
    if (age < 18) {
      throw new InvalidField('data_nascimento');
    }
  }

  async getById(id: string):Promise<PersonCreateModel> {
    if (!PeopleRepository.validId(id)) {
      throw new InvalidField('id');
    }
    const person = await PeopleRepository.findById(id);
    if (!person) {
      throw new NotFound(id);
    }
    return person;
  }

  async list(payload: PersonSearch) {
    let offset: number = 0;
    let limit: number = 10;

    if (payload.limit) {
      limit = parseInt(payload.limit, 10);
      payload.limit = undefined;
    }
    if (payload.offset) {
      offset = parseInt(payload.offset, 10);
      payload.offset = undefined;
    }
    if (payload.senha) {
      payload.senha = undefined;
    }
    return PeopleRepository.findAll(payload, offset, limit);
  }

  async delete(id: string) {
    await this.getById(id);
    return PeopleRepository.delete(id);
  }

  async update(id: string, payload: PersonCreateModel) {
    await this.getById(id);
    if (payload.data_nascimento) {
      this.isOlder(payload.data_nascimento);
    }
    const person = await PeopleRepository.update(id, payload);
    // person.data_nascimento = this.toFormatedDate(person.data_nascimento as string);
    return person;
  }
}

export default new PeopleService();
