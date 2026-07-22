const mockFont = () => ({ className: "font-mock", style: {} });

module.exports = new Proxy(
  {},
  {
    get: () => mockFont,
  },
);
