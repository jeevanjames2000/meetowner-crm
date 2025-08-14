import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus,
  Clock,
  MapPin,
  Headset,
  CircleUser,
  UserRound,
} from "lucide-react";
import { RootState } from "../../store/store";
import { getAllMetrics } from "../../store/slices/leadslice";
import { Link } from "react-router";
const userTypeMap = {
  total_leads: "Total Leads",
  today_leads: "Today Leads",
  today_follow_ups: "Today Follow-Ups",
  site_visit_done: "Site Visits Done",
  sales_manager: "Sales Manager",
  tele_callers: "Telecallers",
  marketing_executives: "Marketing Agent",
};
const userTypeRoutes = {
  total_leads: "/leads/new/0",
  today_leads: "/leads/today/2",
  today_follow_ups: "/leads/today/2",
  site_visit_done: "/leads/SiteVisitDone/5",
  sales_manager: "/employee/2",
  tele_callers: "/employee/3",
  marketing_executives: "/employee/4",
};
const iconMap = {
  total_leads: UserPlus,
  today_leads: Clock,
  today_follow_ups: Clock,
  site_visit_done: MapPin,
  sales_manager: UserRound,
  tele_callers: Headset,
  marketing_executives: CircleUser,
};
const cardColors = [
  "from-blue-500/10 to-cyan-500/10 border-blue-200/50",
  "from-purple-500/10 to-pink-500/10 border-purple-200/50",
  "from-emerald-500/10 to-teal-500/10 border-emerald-200/50",
  "from-orange-500/10 to-red-500/10 border-orange-200/50",
  "from-indigo-500/10 to-blue-500/10 border-indigo-200/50",
];
const iconBgColors = [
  "bg-gradient-to-br from-blue-500 to-cyan-600",
  "bg-gradient-to-br from-purple-500 to-pink-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-indigo-500 to-blue-600",
];
export default function Home() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { leadMetrics, loading } = useSelector(
    (state: RootState) => state.lead
  );
  const allowedUserTypes = [
    "total_leads",
    "today_leads",
    "today_follow_ups",
    "site_visit_done",
    "sales_manager",
    "tele_callers",
    "marketing_executives",
  ];
  const filteredCounts = useMemo(() => {
    if (!leadMetrics) {
      return allowedUserTypes.map((userType) => ({
        user_type: userType,
        count: 0,
      }));
    }
    return allowedUserTypes.map((userType) => ({
      user_type: userType,
      count: leadMetrics[userType as keyof LeadMetrics] || 0,
    }));
  }, [leadMetrics]);
  const dispatch = useDispatch();
  useEffect(() => {
    if (user?.user_id) {
      dispatch(getAllMetrics({ user_id: user.user_id }));
    }
  }, [dispatch, user?.user_id]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Welcome back, {user?.name || "User"}!
          </h1>
        </div>
        <p className="text-slate-600 ml-5">
          Here's an overview of your team performance
        </p>
      </div>
      {loading && (
        <div className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Loading counts...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounts.map((item, index) => {
          const IconComponent = iconMap[item.user_type] || UserRound;
          const route = userTypeRoutes[item.user_type] || "#";
          return (
            <Link
              key={item.user_type}
              to={route}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
            >
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${
                  cardColors[index % cardColors.length]
                } backdrop-blur-sm border shadow-lg p-6`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative mb-6">
                  <div
                    className={`w-12 h-12 ${
                      iconBgColors[index % iconBgColors.length]
                    } rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-slate-600 text-sm font-medium mb-1">
                      {userTypeMap[item.user_type] ||
                        `User Type ${item.user_type}`}
                    </h4>
                    <div className="text-2xl font-bold text-slate-800">
                      {Number(item.count).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
