import * as Router from 'koa-router';

import MonzoController from './controllers/monzo';
import StarlingController from './controllers/starling';

const router = new Router();

const handleWebhook = async (
  context: Router.IRouterContext,
  controller: any,
  // controller: MonzoController | StarlingController,
) => {
  if (context.request.query.secret !== process.env.URL_SECRET) {
    context.body = {
      message: 'error',
      error: "URL secret doesn't match",
    };

    return;
  }

  let transactionController;

  try {
    transactionController = new controller(
      context.request.body,
    );
  } catch (error) {
    console.error('error:', error);

    context.body = {
      message: 'error',
      error: error.message,
    };

    return;
  }

  try {
    const transaction = await transactionController
      .createTransaction()
      .catch((error: any) => {
        throw error.error;
      });

    console.log(
      'Created transaction:',
      JSON.stringify(transaction, undefined, '  '),
    );

    context.body = {
      message: 'success',
      transaction: transaction,
    };
  } catch (error) {
    console.error('error:', error);

    context.body = {
      message: 'error',
      error,
    };
  }
};

router.post('/monzo', async (context: Router.IRouterContext) => {
  await handleWebhook(context, MonzoController);
});

router.post('/starling', async (context: Router.IRouterContext) => {
  await handleWebhook(context, StarlingController);
});

export default router;
