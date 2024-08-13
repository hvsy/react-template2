import dayjs from "dayjs";
import {http, HttpResponse} from "msw";


// remember you have to match the params that you're passing here
const base = `${import.meta.env.API || ''}`;
console.log('mock base:',base);
const getUserData = http.get(`${base}/ping`, ({}) =>
        HttpResponse.json(dayjs().format('YYYY-MM-DD hh:mm:ss'))
);

//it returns array of request handlers
export const handlers = [getUserData];
