// // import React, { useState, useEffect } from "react";
// // import {
// //   User,
// //   Mail,
// //   Phone,
// //   MapPin,
// //   Calendar,
// //   Star,
// //   Globe,
// //   Github,
// //   Linkedin,
// //   Twitter,
// // } from "lucide-react";
// // import { useAuth } from "../context/AuthContext";

// export default function Profile() {
//   const { user, token, axiosInstance } = useAuth();

//   const [userData, setUserData] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch profile data
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);

//         const [userRes, statsRes, reviewsRes] = await Promise.all([
//           axiosInstance.get("/users/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axiosInstance.get("/users/me/stats", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axiosInstance.get("/users/me/reviews", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         setUserData(userRes.data);
//         setStats(statsRes.data);
//         setReviews(reviewsRes.data);
//       } catch (error) {
//         console.error("Error fetching profile data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) fetchProfile();
//   }, [token, axiosInstance]);

//   if (loading) {
//     return <div className="text-center py-10">Loading profile...</div>;
//   }

//   if (!userData) {
//     return <div className="text-center py-10">No profile data found.</div>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-12">
//       {/* Profile Header */}
//       <div className="bg-white shadow-xl rounded-2xl p-8 mb-10 border border-gray-100">
//         <div className="flex items-center gap-6">
//           <img
//             src={`https://ui-avatars.com/api/?name=${userData.name}&background=random`}
//             alt={userData.name}
//             className="w-28 h-28 rounded-full border-4 border-indigo-100 shadow-md"
//           />
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               {userData.name}
//             </h1>
//             <p className="text-gray-500">{userData.bio}</p>
//             <div className="flex gap-4 mt-3 text-gray-600">
//               {userData.website && (
//                 <a href={userData.website} target="_blank" rel="noreferrer">
//                   <Globe className="w-5 h-5 hover:text-indigo-600" />
//                 </a>
//               )}
//               {userData.github && (
//                 <a
//                   href={`https://github.com/${userData.github}`}
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <Github className="w-5 h-5 hover:text-indigo-600" />
//                 </a>
//               )}
//               {userData.linkedin && (
//                 <a
//                   href={`https://linkedin.com/in/${userData.linkedin}`}
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <Linkedin className="w-5 h-5 hover:text-indigo-600" />
//                 </a>
//               )}
//               {userData.twitter && (
//                 <a
//                   href={`https://twitter.com/${userData.twitter}`}
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <Twitter className="w-5 h-5 hover:text-indigo-600" />
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Contact Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-gray-700">
//           <p className="flex items-center gap-2">
//             <Mail className="w-5 h-5 text-indigo-600" /> {userData.email}
//           </p>
//           <p className="flex items-center gap-2">
//             <Phone className="w-5 h-5 text-indigo-600" /> {userData.phone}
//           </p>
//           <p className="flex items-center gap-2">
//             <MapPin className="w-5 h-5 text-indigo-600" /> {userData.location}
//           </p>
//           <p className="flex items-center gap-2">
//             <Calendar className="w-5 h-5 text-indigo-600" /> Joined{" "}
//             {new Date(userData.joinDate).toLocaleDateString()}
//           </p>
//         </div>
//       </div>

//       {/* Stats Section */}
//       {stats && (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-indigo-50 p-6 rounded-xl text-center shadow-sm">
//             <p className="text-2xl font-bold text-indigo-700">
//               {stats.totalSkills}
//             </p>
//             <p className="text-gray-600">Skills</p>
//           </div>
//           <div className="bg-indigo-50 p-6 rounded-xl text-center shadow-sm">
//             <p className="text-2xl font-bold text-indigo-700">
//               {stats.totalEndorsements}
//             </p>
//             <p className="text-gray-600">Endorsements</p>
//           </div>
//           <div className="bg-indigo-50 p-6 rounded-xl text-center shadow-sm">
//             <p className="text-2xl font-bold text-indigo-700">
//               {stats.mentoringSessions}
//             </p>
//             <p className="text-gray-600">Sessions</p>
//           </div>
//           <div className="bg-indigo-50 p-6 rounded-xl text-center shadow-sm">
//             <p className="text-2xl font-bold text-indigo-700">
//               {stats.requestsReceived}
//             </p>
//             <p className="text-gray-600">Requests Received</p>
//           </div>
//           <div className="bg-indigo-50 p-6 rounded-xl text-center shadow-sm">
//             <p className="text-2xl font-bold text-indigo-700">
//               {stats.requestsSent}
//             </p>
//             <p className="text-gray-600">Requests Sent</p>
//           </div>
//         </div>
//       )}

//       {/* Reviews Section */}
//       <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">
//           Reviews ({reviews.length})
//         </h2>
//         {reviews.length > 0 ? (
//           <div className="space-y-6">
//             {reviews.map((review) => (
//               <div key={review._id} className="border-b border-gray-200 pb-4">
//                 <div className="flex justify-between items-center mb-2">
//                   <p className="font-semibold text-gray-800">
//                     {review.from.name}
//                   </p>
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${
//                           i < review.rating
//                             ? "text-yellow-400 fill-yellow-400"
//                             : "text-gray-300"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <p className="text-gray-700">{review.comment}</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {new Date(review.date).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-600">No reviews yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }
