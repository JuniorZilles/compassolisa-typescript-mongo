import InvalidValue from '@errors/InvalidValue';
import { Person } from '@interfaces/people/Person';
import PeopleRepository from '@repositories/PeopleRepository';
import validateCPF from '@utils/CpfValidation';
import moment from 'moment';

const checkCpf = ({ cpf }: { cpf: string }): void => {
  if (!validateCPF(cpf)) {
    throw new InvalidValue('Bad Request', `CPF ${cpf} is invalid`);
  }
};

const checkIfIsValidCpf = (result: Person, cpf: string, email: string): void => {
  if (result.cpf === cpf) {
    throw new InvalidValue('Conflict', `CPF ${cpf} already in use`);
  } else if (result.email === email) {
    throw new InvalidValue('Conflict', `Email ${email} already in use`);
  }
};

const checkIfExistsEmailOrCpf = async (
  email: string,
  cpf: string,
  id: string | undefined = undefined
): Promise<void> => {
  const result = await PeopleRepository.getUserEmailOrCpf(email, cpf, id);
  if (result && result.id !== id) {
    checkIfIsValidCpf(result, cpf, email);
  }
};
export const isOlderAndTransfromToDateString = (data_nascimento: string): Date => {
  const birthday = moment(data_nascimento, 'DD/MM/YYYY');
  const age = moment().diff(birthday, 'years', false);
  if (age < 18) {
    throw new InvalidValue('data_nascimento', 'Age is less than 18');
  }
  return birthday.toDate();
};
export const validateOnCreatePerson = async (person: Person): Promise<void> => {
  checkCpf(person);
  await checkIfExistsEmailOrCpf(person.email, person.cpf);
};
export const validateOnUpdatePerson = async (person: Person, id: string): Promise<void> => {
  checkCpf(person);
  await checkIfExistsEmailOrCpf(person.email, person.cpf, id);
};
