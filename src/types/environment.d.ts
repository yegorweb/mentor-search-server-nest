export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
      HTTPS: string
      
      MONGO_URL: string
      CLIENT_URL: string
      
      JWT_ACCESS_SECRET: string
      JWT_REFRESH_SECRET: string
      
      EMAIL: string
      EMAIL_PASSWORD: string    

      SELECTEL_ACCOUNT: string
      BUCKET_NAME: string
      BUCKET_ACCOUNT: string
      BUCKET_PASSWORD: string
    }
  }
}
