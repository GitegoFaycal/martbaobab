import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import morgan from 'morgan';
const app=express(); const PORT=process.env.PORT || 5000;
app.use(helmet()); app.use(cors({origin:process.env.CLIENT_URL || 'http://localhost:5173'})); app.use(express.json()); app.use(morgan('dev'));
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'MartBaobab API'}));
app.get('/api/categories',(req,res)=>res.json({data:['Food','Construction','Training','Delivery','Beauty','Electronics','Home Services']}));
app.use((req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Unexpected server error'});});
app.listen(PORT,()=>console.log(`MartBaobab API running at http://localhost:${PORT}`));
