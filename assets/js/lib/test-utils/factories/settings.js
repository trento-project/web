import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { formatISO } from 'date-fns';

export const apiKeySettingsFactory = Factory.define(() => ({
  expire_at: formatISO(faker.date.future()),
  created_at: formatISO(faker.date.past()),
  generated_api_key:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBpX2tleSIsImV4cCI6MTcxMjE1MzE3MCwiaWF0IjoxNzA5NzMzOTcxLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiYmZmMjA0YjUtMzJmMS00YmVlLThiMGItY2IxZGQwNTlmNGRjIiwibmJmIjoxNzA5NzMzOTcxLCJ0eXAiOiJCZWFyZXIifQ.0Lz0MwZaFpIGbSohnkiJ6AN5FFb5Vg5ZVhqM3fdUf3M',
}));
