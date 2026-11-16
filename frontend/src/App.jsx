import AppRoutes from "./routes/AppRoutes"
import { Toaster } from "sonner";
function App() {
  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //   <h1 className="text-3xl font-bold text-blue-600">
    //     Academic Knowledge Hub
    //   </h1>
    // </div>
    <>
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </>



  )
}

export default App