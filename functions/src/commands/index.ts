import Router from '../Router';
import echo from './echo';
import exec from './exec';

const router = new Router();

router.use(echo);
router.use(exec);

export default router;
