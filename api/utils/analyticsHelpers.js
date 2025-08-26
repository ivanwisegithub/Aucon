// Optional helper functions for analytics processing

exports.groupByDate = (items, dateField = 'timestamp') => {
  return items.reduce((acc, item) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
};
