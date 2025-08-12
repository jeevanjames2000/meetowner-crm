
import axios from "axios";



const axiosIstance = axios.create({
    baseURL:"https://testapi.meetowner.in/"
})

export default axiosIstance;

