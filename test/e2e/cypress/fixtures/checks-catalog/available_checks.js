export const availableChecks = new Map([
  [
    'Corosync',
    [
      '00081D',
      '0B6DB2',
      '156F64',
      '15F7A8',
      '205AF7',
      '21FCA6',
      '24ABCB',
      '32CFC6',
      '33403D',
      '53D035',
      '6E9B82',
      '7E0221',
      '822E47',
      '845CC9',
      'A1244C',
      'C620DC',
      'D78671',
      'DA114A',
      'FB0E0D',
    ],
  ],
  ['Pacemaker', ['373DB8']],
  ['SBD', ['49591F', '61451E', '68626E', '816815', 'A2EF8C', 'B089BE']],
  [
    'OS and package versions',
    [
      '222A57',
      '9FAAD0',
      '9FEFB0',
      'C3166E',
      'CAEFF1',
      'D028B9',
      'DC5429',
      'F50AF5',
    ],
  ],
  ['Miscellaneous', ['790926']],
]);

export const checkDataByProvider = new Map([
  ['aws', '5000'],
  ['azure', '30000'],
]);
