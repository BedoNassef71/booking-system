const NotFoundException = require('../utils/exceptions/not-found.exception');
const emailsEvent = require('../utils/helpers/events/emails.events');
const paginationDetails = require('../utils/helpers/pagination/pagination-details');
const Offering = require('./models/offering.model');

exports.create = async ({
  name,
  description,
  price,
  location,
  capacity,
  images,
  facilities,
  days,
  category,
}) => {
  const offering = await Offering.create({
    name,
    description,
    price,
    location,
    capacity,
    images,
    facilities,
    days,
    category,
  });
  emailsEvent.emit('offering.create', { name });
  return offering;
};

const countDocuments = async ({ filter }) => {
  return await Offering.countDocuments(filter);
};

exports.findAll = async ({ query }) => {
  const keyword = query.keyword;
  const search = keyword ? { $or: keyword } : {};
  const filter = { ...query.filter, ...search };
  const count = countDocuments({ filter });
  const data = await Offering.find(filter)
    .select(query.filter)
    .skip(query.skip)
    .limit(query.limit)
    .sort(query.sort);
  return paginationDetails({
    page: query.page,
    limit: query.limit,
    count,
    data,
  });
};

exports.findOne = async ({ id }) => {
  const offer = await Offering.findById(id);
  if (offer) {
    return offer;
  }
  throw new NotFoundException(`Offering ${id} not found`);
};

exports.remove = async ({ id }) => {
  await Offering.findByIdAndRemove(id);
};

exports.update = async ({ id, data }) => {
  return await Offering.findByIdAndUpdate(id, { ...data }, { new: true });
};
