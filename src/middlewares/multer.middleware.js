// import multer from "multer"

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
   
//       cb(null, file.originalname)
//     }
//   })
  
//   export const upload = multer({ storage, })
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
 
})
// export const upload = multer({ storage }).fields([
//   { name: "thumbnail", maxCount: 1 },
//   { name: "Video", maxCount: 1 },
// ]);