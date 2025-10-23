import {auth} from '@/lib/auth.js';
import {createRouter} from '@/lib/create-router.js';

const router = createRouter();

router.on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw));

export default router;
