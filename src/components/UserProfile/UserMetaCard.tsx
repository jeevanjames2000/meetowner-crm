import { useSelector } from "react-redux";
import { RootState } from "../../store/store";



interface Option {
  value: number;
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  { value: 2, text: "Builder" },
  { value: 3, text: "Channel Partner" },
  { value: 4, text: "Sales Manager" },
  { value: 5, text: "Telecallers" },
  { value: 6, text: "Marketing agent" },
  { value: 7, text: "Receptionist" },
];

export default function UserMetaCard() {
  
const { selectedUser, loading, error } = useSelector((state: RootState) => state.user);
  

  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find(option => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };

  

 
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-2xl">
      <div className="flex flex-col xl:flex-row items-center gap-6">
       
       

        <div className="flex-1 text-center xl:text-left">
          
            <>
            
              <h4 className="text-2xl font-semibold text-slate-800 dark:text-white mb-1">{selectedUser?.name}</h4>
              <h4 className="text-2xl font-semibold text-slate-800 dark:text-white mb-1">Mobile :{selectedUser?.mobile}</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-x-2">
                <span>{getDesignationText(selectedUser?.user_type)}</span>
               
                <span className="hidden sm:inline-block w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                  <span>{selectedUser?.email}</span>
                   <span className="hidden sm:inline-block w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                <span>{selectedUser?.city}</span>
              </div>
            </>
          
            
              

             
            </div>
          
        </div>
      </div>
    
  );
}
