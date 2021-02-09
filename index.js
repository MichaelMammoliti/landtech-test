#!/usr/bin/env node

const fs = require("fs");

const getCompanies = () => {
  return fs.readFileSync("./data/company_relations.csv", "utf8")
    .split("\n")
    .slice(1) // header row
    .map((line) => {
      const [id, name, parentId] = line.split(",");

      return { id, name, parentId };
    });
};

const getLands = () => {
  return fs.readFileSync("./data/land_ownership.csv", "utf8")
    .split("\n")
    .slice(1) // header row
    .map((line) => {
      const [id, companyId] = line.split(",");

      return { id, companyId };
    });
};

const getArgs = (args = process.argv) => {
  const [x, y, ...arr] = args;

  return arr.reduce((acc, item) => {
    const [key, value] = item.split('=');

    if (value) {
      acc.options[key.replace('--', '')] = value;
    } else {
      acc.values.push(key);
    }

    return acc;
  }, { options: {}, values: [] });
};

const getOwnedLands = (company, lands) => {
  return lands.filter(({ companyId }) => company.id === companyId);
};

const getOwnedLandsCount = (company, lands) => {
  const ownedLands = getOwnedLands(company, lands);
  let ownedLandsCount = ownedLands.length;

  if (company.items && company.items.length) {
    ownedLandsCount = company.items.reduce((acc, item) => acc + item.ownedLandsCount, ownedLandsCount);
  };

  return ownedLandsCount;
};

const extendWithLandCount = (data, lands) => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, ownedLandsCount: getOwnedLandsCount(item, lands) }))
  }

  if (data && data.id) {
    return { ...data, ownedLandsCount: getOwnedLandsCount(data, lands) };
  }

  return data;
};

const getTree = (companyObj, companies, lands, options) => {
  const fn = (company) => {
    const currentCompany = company || companies.find(({ id }) => id === companyObj.id);
    const parentCompany = options.mode === 'from_root' && companies.find(({ id }) => id === currentCompany.parentId);
    const siblingCompanies = companies.filter(({ parentId, id }) => parentId === currentCompany.parentId && id !== currentCompany.id );
    const childCompanies = companies.filter(({ parentId }) => parentId === currentCompany.id);

    let data = parentCompany || currentCompany;

    data.found = data.id === companyObj.id;

    if (options.mode === 'expanded') {
      data.items = extendWithLandCount(childCompanies, lands);
    }

    if (parentCompany) {
      if (options.mode === 'from_root') {
        data.items = extendWithLandCount([{...company, found: company.id === companyObj.id}, ...siblingCompanies], lands);
      }

      data = fn(data);
    }

    return extendWithLandCount(data, lands);
  };

  return [fn(companyObj)];
};

const createMessagePrefix = (level) => {
  const levels = [...Array(level)];

  return levels.reduce((acc, item, index) => {
    acc = acc += ' |';

    if (index === levels.length - 1) {
      acc = acc += ' - ';
    }

    return acc;
  }, '');
};

const createMessage = (level, item) => {
  let prefix = '';

  if (level) {
    prefix = createMessagePrefix(level);
  }

  let str = `${prefix}${item.id}; ${item.name}; owner of ${item.ownedLandsCount} land parcels`;

  if (item.found) {
    str = `${str} ***`;
  }

  return str;
}

const getMessageFromTree = (tree) => {
  const messages = [];

  const fn = (items, level) => {
    items.forEach((item) => {
      const newLevel = level + 1;

      if (item.items && item.items.length) {
        fn(item.items, newLevel);
      }

      messages.unshift(createMessage(newLevel, item))
    });
  }

  fn(tree, -1);

  return messages.join("\n");
};

const run = () => {
  const { options, values } = getArgs();

  if (!Object.keys(options).length) {
    return;
  }

  const companies = getCompanies();
  const lands = getLands();
  const tree = getTree(companies.find(item => item.id === values[0]), companies, lands, options);
  const message = getMessageFromTree(tree);

  console.log(message);
};

run();

module.exports = {
  getTree,
  createMessagePrefix,
  createMessage,
  getMessageFromTree,
  getArgs,
  getOwnedLands,
  getOwnedLandsCount,
  extendWithLandCount,
}
