import * as exphbs from 'express-handlebars';

export const handlebarsConfig = {
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    // Add your custom Handlebars helpers here, if needed
  },
};

export const handlebarsEngine = exphbs.create(handlebarsConfig);
