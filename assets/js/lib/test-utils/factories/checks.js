import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { EXPECT, EXPECT_ENUM, EXPECT_SAME } from '@lib/model';

export const catalogExpectExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT,
    expression: faker.lorem.sentence(),
  })
);

export const catalogExpectSameExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT_SAME,
    expression: faker.lorem.sentence(),
  })
);

export const catalogExpectEnumExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT_ENUM,
    expression: faker.lorem.sentence(),
  })
);

export const catalogConditionFactory = Factory.define(() => ({
  value: faker.lorem.word(),
  expression: faker.lorem.sentence(),
}));

export const catalogValueFactory = Factory.define(() => ({
  name: faker.string.uuid(),
  default: faker.lorem.word(),
  customizable: faker.datatype.boolean(),
  conditions: catalogConditionFactory.buildList(2),
}));

export const catalogCheckFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.cat(),
  description: faker.lorem.paragraph(),
  remediation: faker.lorem.paragraph(),
  metadata: null,
  values: catalogValueFactory.buildList(3),
  expectations: catalogExpectExpectationFactory.buildList(3),
  customizable: faker.datatype.boolean(),
}));

export const catalogFactory = Factory.define(() => ({
  loading: faker.datatype.boolean(),
  catalog: catalogCheckFactory.build(),
  error: null,
}));

export const customizedValueFactory = Factory.define(() => ({
  name: faker.string.uuid(),
  customizable: true,
  current_value: faker.lorem.word(),
  custom_value: faker.lorem.word(),
}));

export const nonCustomizedValueFactory = Factory.define(() => ({
  name: faker.string.uuid(),
  customizable: faker.datatype.boolean(),
  current_value: faker.lorem.word(),
}));

export const selectableCheckFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.dog(),
  description: faker.lorem.paragraph(),
  values: [
    ...customizedValueFactory.buildList(3),
    ...nonCustomizedValueFactory.buildList(3),
  ],
  customizable: faker.datatype.boolean(),
  customized: faker.datatype.boolean(),
}));
