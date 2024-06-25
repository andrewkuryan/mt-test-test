import Router from '../Router';
import echo from './echo';
import exec from './exec';

import mediaGroupMiddleware from './middleware/mediaGroup';

const router = new Router();

router.middleware(mediaGroupMiddleware);

router.use(echo);
router.use(exec);

export default router;
