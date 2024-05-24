import path from 'path'
import multer from 'multer'

const storage = multer.diskStorage({})

export const upload = multer({
    storage:storage,
})

