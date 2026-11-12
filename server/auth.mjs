import { database } from './config.mjs'
export async function authenticate(req,res,next){try{
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
 if(!token)throw Object.assign(new Error('ログインしてください。'),{status:401})
 const client=database(token),r=await client.auth.getUser(token)
 if(r.error||!r.data.user)throw Object.assign(new Error('ログインの有効期限が切れました。再度ログインしてください。'),{status:401})
 req.user=r.data.user;req.userDb=client;next()
}catch(error){next(error)}}
