import app from './app'

const port = Number(process.env.SERVER_PORT) || 3349
app.listen(port, () => console.log(`Executing Server Schedule in port ${port} !`))