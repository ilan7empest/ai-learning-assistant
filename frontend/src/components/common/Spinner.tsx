import { Loader2 } from 'lucide-react'

const Spinner = () => {
    return (
        <div className='flex items-center justify-center p-8'><Loader2 className="w-8 h-8 animate-spin text-[#00d492]" /></div>
    )
}

export default Spinner