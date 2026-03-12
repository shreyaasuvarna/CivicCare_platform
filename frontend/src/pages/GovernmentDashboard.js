// import React, { useEffect, useState } from "react";
// import API from "../api";


// const GovernmentDashboard = () => {

//   const [complaints, setComplaints] = useState([]);

//   const fetchComplaints = async () => {
//    const res = await API.get("/admin/complaints");

//     setComplaints(res.data.complaints);
//   };

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   const updateComplaint = async (id, status, adminNote) => {

//     await API.put(`/admin/complaint/${id}`, {
//   status,
//   adminNote
// });


//     fetchComplaints();
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h2>Government Dashboard</h2>
//       {complaints.length === 0 ? (
//   <p>No complaints available.</p>
// ) : (
//       complaints.map((c) => (
//         <div key={c._id} style={{
//           border:"1px solid #ccc",
//           padding:"15px",
//           marginBottom:"15px"
//         }}>

//           <h3>{c.title}</h3>
//           <p>{c.description}</p>
//           <p><b>Location:</b> {c.location}</p>
//           <p><b>Status:</b> {c.status}</p>

//           <textarea
//             placeholder="Government Action"
//             onChange={(e)=> c.note = e.target.value}
//           />

//           <br/><br/>

//           <button onClick={() =>
//             updateComplaint(c._id,"In Progress",c.note)
//           }>
//             Mark In Progress
//           </button>

//           <button onClick={() =>
//             updateComplaint(c._id,"Resolved",c.note)
//           }>
//             Mark Resolved
//           </button>

//         </div>
//       ))
// )}
//     </div>
//   );
// };

// export default GovernmentDashboard;

import React, { useEffect, useState } from "react";
import API from "../api";

const GovernmentDashboard = () => {

  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    const res = await API.get("/admin/complaints");
    setComplaints(res.data.complaints);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateComplaint = async (id, status, adminNote) => {
    await API.put(`/admin/complaint/${id}`, {
      status,
      adminNote
    });
    fetchComplaints();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Government Dashboard</h1>
          <p style={styles.subtitle}>
            Manage and resolve civic complaints efficiently
          </p>
        </div>

        {complaints.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>No complaints available.</p>
          </div>
        ) : (

          <div style={styles.grid}>
            {complaints.map((c) => (
              <div key={c._id} style={styles.card}>

                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{c.title}</h3>
                  <span style={{
                    ...styles.status,
                    ...(c.status === "Pending" && styles.pending),
                    ...(c.status === "In Progress" && styles.progress),
                    ...(c.status === "Resolved" && styles.resolved)
                  }}>
                    {c.status}
                  </span>
                </div>

                <p style={styles.description}>{c.description}</p>

{c.image && (
  <img
    src={`http://localhost:5000${c.image}`}
    alt="Complaint"
    style={{
      width: "100%",
      height: "180px",
      objectFit: "cover",
      borderRadius: "10px",
      marginTop: "10px"
    }}
  />
)}


                <div style={styles.meta}>
                  <p><b>Location:</b> {c.location}</p>
                  <p><b>Category:</b> {c.category}</p>
                </div>
{/* 
                <textarea
                  placeholder="Government action / note..."
                  style={styles.textarea}
                  onChange={(e)=> c.note = e.target.value}
                /> */}

                <div style={styles.actions}>

                  <button
                    style={{...styles.btn, ...styles.progressBtn}}
                    onClick={() =>
                      updateComplaint(c._id,"In Progress",c.note)
                    }
                  >
                    Mark In Progress
                  </button>

                  <button
                    style={{...styles.btn, ...styles.resolveBtn}}
                    onClick={() =>
                      updateComplaint(c._id,"Resolved",c.note)
                    }
                  >
                    Mark Resolved
                  </button>

                </div>

              </div>
            ))}
          </div>

        )}
      </div>
    </div>
  );
};

const styles = {

  page:{
    minHeight:"100vh",
    background:"#f8fafc",
    padding:"40px",
    display:"flex",
    justifyContent:"center"
  },

  container:{
    width:"100%",
    maxWidth:"1100px"
  },

  header:{
    marginBottom:"30px"
  },

  title:{
    fontSize:"32px",
    fontWeight:"800",
    color:"#1e3a8a",
    marginBottom:"5px"
  },

  subtitle:{
    color:"#64748b"
  },

  emptyBox:{
    background:"#fff",
    padding:"40px",
    borderRadius:"12px",
    textAlign:"center",
    boxShadow:"0 2px 10px rgba(0,0,0,0.05)"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
    gap:"20px"
  },

  card:{
    background:"#fff",
    borderRadius:"14px",
    padding:"20px",
    boxShadow:"0 4px 18px rgba(0,0,0,0.07)",
    display:"flex",
    flexDirection:"column",
    gap:"12px"
  },

  cardHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },

  cardTitle:{
    fontSize:"18px",
    fontWeight:"700",
    color:"#0f172a"
  },

  status:{
    padding:"4px 10px",
    borderRadius:"6px",
    fontSize:"12px",
    fontWeight:"600"
  },

  pending:{
    background:"#fef3c7",
    color:"#92400e"
  },

  progress:{
    background:"#dbeafe",
    color:"#1e40af"
  },

  resolved:{
    background:"#dcfce7",
    color:"#166534"
  },

  description:{
    color:"#475569",
    fontSize:"14px"
  },

  meta:{
    fontSize:"13px",
    color:"#475569"
  },

  textarea:{
    padding:"10px",
    border:"1px solid #cbd5f5",
    borderRadius:"8px",
    resize:"none",
    minHeight:"70px",
    fontSize:"14px"
  },

  actions:{
    display:"flex",
    gap:"10px",
    marginTop:"10px"
  },

  btn:{
    border:"none",
    padding:"10px 14px",
    borderRadius:"8px",
    fontWeight:"600",
    cursor:"pointer",
    fontSize:"13px"
  },

  progressBtn:{
    background:"#3b82f6",
    color:"#fff"
  },

  resolveBtn:{
    background:"#16a34a",
    color:"#fff"
  }

};

export default GovernmentDashboard;
