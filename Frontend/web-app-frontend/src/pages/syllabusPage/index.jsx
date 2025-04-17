import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow, // Import useReactFlow hook
} from '@xyflow/react';
import dagre from 'dagre';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import '@xyflow/react/dist/style.css';


const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));



const syllabusData = {
  'Web Development': {
    nodes: [
      { id: 'wd-1', data: { label: 'HTML Basics' } },
      { id: 'wd-2', data: { label: 'CSS Fundamentals' } },
      { id: 'wd-3', data: { label: 'JavaScript Core' } },
      { id: 'wd-4', data: { label: 'DOM Manipulation' } },
      { id: 'wd-5', data: { label: 'Frontend Framework (React/Vue/Angular)' } },
      { id: 'wd-6', data: { label: 'State Management' } },
      { id: 'wd-7', data: { label: 'Node.js Backend' } },
      { id: 'wd-8', data: { label: 'Express.js Framework' } },
      { id: 'wd-9', data: { label: 'Databases (SQL/NoSQL)' } },
      { id: 'wd-10', data: { label: 'Authentication & Authorization' } },
    ],
    edges: [
      { id: 'e-wd-1-2', source: 'wd-1', target: 'wd-2' },
      { id: 'e-wd-2-3', source: 'wd-2', target: 'wd-3' },
      { id: 'e-wd-3-4', source: 'wd-3', target: 'wd-4' },
      { id: 'e-wd-4-5', source: 'wd-4', target: 'wd-5' },
      { id: 'e-wd-5-6', source: 'wd-5', target: 'wd-6' },
      { id: 'e-wd-3-7', source: 'wd-3', target: 'wd-7' },
      { id: 'e-wd-7-8', source: 'wd-7', target: 'wd-8' },
      { id: 'e-wd-8-9', source: 'wd-8', target: 'wd-9' },
      { id: 'e-wd-8-10', source: 'wd-8', target: 'wd-10' },
    ],
    resources: {
      'HTML Basics': ['MDN Web Docs: HTML', 'W3Schools HTML Tutorial', 'freeCodeCamp HTML & CSS'],
      'CSS Fundamentals': ['MDN Web Docs: CSS', 'CSS-Tricks', 'Flexbox Froggy', 'Grid Garden'],
      'JavaScript Core': ['Eloquent JavaScript (Book)', 'JavaScript.info', 'MDN Web Docs: JavaScript'],
      'DOM Manipulation': ['MDN DOM Introduction', 'JavaScript DOM Crash Course (YouTube)'],
      'Frontend Framework (React/Vue/Angular)': ['React Docs', 'Vue.js Docs', 'Angular Docs', 'Official Tutorials'],
      'State Management': ['Redux Docs', 'Vuex Docs', 'Zustand (React)', 'Pinia (Vue)'],
      'Node.js Backend': ['Node.js Docs', 'The Odin Project - Node.js', 'NodeSchool Workshoppers'],
      'Express.js Framework': ['Express.js Docs', 'MDN Express Tutorial', 'Building REST APIs with Express'],
      'Databases (SQL/NoSQL)': ['SQLBolt', 'PostgreSQL Docs', 'MongoDB University', 'Redis Docs'],
      'Authentication & Authorization': ['OWASP Authentication Cheat Sheet', 'Passport.js Docs', 'JWT.io'],
    }
  },
  'Operating Systems': {
    nodes: [
      { id: 'os-1', data: { label: 'Introduction & History' } },
      { id: 'os-2', data: { label: 'Process Management' } },
      { id: 'os-3', data: { label: 'Threads & Concurrency' } },
      { id: 'os-4', data: { label: 'CPU Scheduling Algorithms' } },
      { id: 'os-5', data: { label: 'Memory Management (Paging, Segmentation)' } },
      { id: 'os-6', data: { label: 'Virtual Memory' } },
      { id: 'os-7', data: { label: 'File Systems' } },
      { id: 'os-8', data: { label: 'I/O Management' } },
    ],
    edges: [
      { id: 'e-os-1-2', source: 'os-1', target: 'os-2' },
      { id: 'e-os-2-3', source: 'os-2', target: 'os-3' },
      { id: 'e-os-3-4', source: 'os-3', target: 'os-4' },
      { id: 'e-os-4-5', source: 'os-4', target: 'os-5' },
      { id: 'e-os-5-6', source: 'os-5', target: 'os-6' },
      { id: 'e-os-1-7', source: 'os-1', target: 'os-7' },
      { id: 'e-os-1-8', source: 'os-1', target: 'os-8' },
    ],
    resources: {
      'Introduction & History': ['Operating System Concepts (Silberschatz, Galvin, Gagne)', 'OSDev Wiki', 'GeeksForGeeks OS Intro'],
      'Process Management': ['OSDev Process Management', 'Silberschatz Ch. 3', 'Process vs Thread Explanation'],
      'Threads & Concurrency': ['Silberschatz Ch. 4', 'POSIX Threads Programming', 'Java Concurrency Docs'],
      'CPU Scheduling Algorithms': ['Silberschatz Ch. 5', 'GeeksForGeeks CPU Scheduling', 'Interactive Scheduler Visualizer'],
      'Memory Management (Paging, Segmentation)': ['Silberschatz Ch. 8', 'OSDev Paging', 'Virtual Memory Intro (YouTube)'],
      'Virtual Memory': ['Silberschatz Ch. 9', 'How Virtual Memory Works', 'Demand Paging Explained'],
      'File Systems': ['Silberschatz Ch. 10-11', 'How File Systems Work (Ext4, NTFS)', 'OSDev File Systems'],
      'I/O Management': ['Silberschatz Ch. 12', 'OSDev I/O', 'Disk Scheduling Algorithms'],
    }
  },
  'Data Structures and Algorithms': {
    nodes: [
        { id: 'dsa-1', data: { label: 'Algorithm Analysis (Big O)' } },
        { id: 'dsa-2', data: { label: 'Arrays & Strings' } },
        { id: 'dsa-3', data: { label: 'Linked Lists' } },
        { id: 'dsa-4', data: { label: 'Stacks & Queues' } },
        { id: 'dsa-5', data: { label: 'Hash Tables' } },
        { id: 'dsa-6', data: { label: 'Trees (BST, Heaps)' } },
        { id: 'dsa-7', data: { label: 'Graphs' } },
        { id: 'dsa-8', data: { label: 'Sorting Algorithms' } },
        { id: 'dsa-9', data: { label: 'Searching Algorithms' } },
        { id: 'dsa-10', data: { label: 'Dynamic Programming' } },
    ],
    edges: [
        { id: 'e-dsa-1-2', source: 'dsa-1', target: 'dsa-2' },
        { id: 'e-dsa-2-3', source: 'dsa-2', target: 'dsa-3' },
        { id: 'e-dsa-3-4', source: 'dsa-3', target: 'dsa-4' },
        { id: 'e-dsa-2-5', source: 'dsa-2', target: 'dsa-5' },
        { id: 'e-dsa-4-6', source: 'dsa-4', target: 'dsa-6' },
        { id: 'e-dsa-5-6', source: 'dsa-5', target: 'dsa-6' },
        { id: 'e-dsa-6-7', source: 'dsa-6', target: 'dsa-7' },
        { id: 'e-dsa-1-8', source: 'dsa-1', target: 'dsa-8' },
        { id: 'e-dsa-1-9', source: 'dsa-1', target: 'dsa-9' },
        { id: 'e-dsa-7-10', source: 'dsa-7', target: 'dsa-10'},
        { id: 'e-dsa-6-10', source: 'dsa-6', target: 'dsa-10'},
    ],
    resources: {
        'Algorithm Analysis (Big O)': ['Big O Cheat Sheet', 'Khan Academy Algo Analysis', 'CLRS Ch. 1-3'],
        'Arrays & Strings': ['LeetCode Array Problems', 'GeeksForGeeks Array', 'String Manipulation Techniques'],
        'Linked Lists': ['VisuAlgo Linked List', 'LeetCode Linked List', 'Implementing Linked Lists (Tutorial)'],
        'Stacks & Queues': ['GeeksForGeeks Stack', 'GeeksForGeeks Queue', 'Stack/Queue Applications'],
        'Hash Tables': ['Hash Table Implementation (YouTube)', 'Collision Resolution Techniques', 'CLRS Ch. 11'],
        'Trees (BST, Heaps)': ['VisuAlgo BST', 'LeetCode Tree Problems', 'Binary Heap Explained', 'CLRS Ch. 6, 12'],
        'Graphs': ['VisuAlgo Graph Traversal', 'Graph Algorithms (DFS, BFS, Dijkstra)', 'CLRS Ch. 22-24'],
        'Sorting Algorithms': ['Sorting Algorithm Visualizer (Toptal)', 'Comparison Sorts Explained', 'CLRS Ch. 2, 7, 8'],
        'Searching Algorithms': ['Binary Search Explained', 'Linear vs Binary Search', 'CLRS Ch. 2'],
        'Dynamic Programming': ['LeetCode DP Problems', 'GeeksForGeeks DP', 'DP Patterns (Tutorial)'],
    }
  },
  'Database Management Systems': {
    nodes: [
      { id: 'db-1', data: { label: 'Introduction to Databases' } },
      { id: 'db-2', data: { label: 'Relational Model & Algebra' } },
      { id: 'db-3', data: { label: 'SQL Basics' } },
      { id: 'db-4', data: { label: 'ER Modeling' } },
      { id: 'db-5', data: { label: 'Database Normalization' } },
      { id: 'db-6', data: { label: 'Indexing & Hashing' } },
      { id: 'db-7', data: { label: 'Transactions & Concurrency Control' } },
      { id: 'db-8', data: { label: 'Introduction to NoSQL' } },
    ],
    edges: [
      { id: 'e-db-1-2', source: 'db-1', target: 'db-2' },
      { id: 'e-db-2-3', source: 'db-2', target: 'db-3' },
      { id: 'e-db-1-4', source: 'db-1', target: 'db-4' },
      { id: 'e-db-4-5', source: 'db-4', target: 'db-5' },
      { id: 'e-db-3-5', source: 'db-3', target: 'db-5' },
      { id: 'e-db-3-6', source: 'db-3', target: 'db-6' },
      { id: 'e-db-6-7', source: 'db-6', target: 'db-7' },
      { id: 'e-db-1-8', source: 'db-1', target: 'db-8' },
    ],
    resources: {
      'Introduction to Databases': ['Database System Concepts (Silberschatz)', 'Khan Academy SQL Course Intro', 'What is a Database? (Article)'],
      'Relational Model & Algebra': ['Silberschatz Ch. 2', 'Relational Algebra Tutorial', 'Stanford DB Course Notes'],
      'SQL Basics': ['SQLZoo', 'Mode Analytics SQL Tutorial', 'W3Schools SQL', 'PostgreSQL/MySQL Docs'],
      'ER Modeling': ['Lucidchart ER Diagram Tutorial', 'Silberschatz Ch. 7', 'ER Diagram Symbols Explained'],
      'Database Normalization': ['Normalization Explained (StudyTonight)', 'Silberschatz Ch. 8', 'Anomalies and Normal Forms'],
      'Indexing & Hashing': ['Silberschatz Ch. 11', 'Use The Index, Luke!', 'B-Trees Explained'],
      'Transactions & Concurrency Control': ['Silberschatz Ch. 14-15', 'ACID Properties Explained', 'Locking Mechanisms'],
      'Introduction to NoSQL': ['MongoDB University M001', 'NoSQL Distilled (Book)', 'Types of NoSQL Databases (Article)'],
    }
  },
   'Computer Networks': {
    nodes: [
      { id: 'cn-1', data: { label: 'Introduction & Layered Models (OSI, TCP/IP)' } },
      { id: 'cn-2', data: { label: 'Physical Layer' } },
      { id: 'cn-3', data: { label: 'Data Link Layer (Ethernet, MAC, Switches)' } },
      { id: 'cn-4', data: { label: 'Network Layer (IP, Routing, Routers)' } },
      { id: 'cn-5', data: { label: 'Transport Layer (TCP, UDP, Congestion Control)' } },
      { id: 'cn-6', data: { label: 'Application Layer (HTTP, DNS, SMTP)' } },
      { id: 'cn-7', data: { label: 'Network Security Basics' } },
      { id: 'cn-8', data: { label: 'Wireless & Mobile Networks' } },
    ],
    edges: [
      { id: 'e-cn-1-2', source: 'cn-1', target: 'cn-2' },
      { id: 'e-cn-2-3', source: 'cn-2', target: 'cn-3' },
      { id: 'e-cn-3-4', source: 'cn-3', target: 'cn-4' },
      { id: 'e-cn-4-5', source: 'cn-4', target: 'cn-5' },
      { id: 'e-cn-5-6', source: 'cn-5', target: 'cn-6' },
      { id: 'e-cn-1-7', source: 'cn-1', target: 'cn-7' }, // Security relevant early on
      { id: 'e-cn-6-7', source: 'cn-6', target: 'cn-7' }, // Security applied at app layer too
      { id: 'e-cn-3-8', source: 'cn-3', target: 'cn-8' }, // Wireless builds on link layer
      { id: 'e-cn-4-8', source: 'cn-4', target: 'cn-8' }, // And network layer
    ],
    resources: {
      'Introduction & Layered Models (OSI, TCP/IP)': ['Computer Networking: A Top-Down Approach (Kurose & Ross)', 'TCP/IP Guide', 'Cloudflare Learning Center: OSI Model'],
      'Physical Layer': ['Kurose & Ross Ch. 2', 'Network Cabling Types', 'Signal Encoding Techniques'],
      'Data Link Layer (Ethernet, MAC, Switches)': ['Kurose & Ross Ch. 5', 'How Switches Work', 'MAC Addresses Explained', 'Wireshark (Tool)'],
      'Network Layer (IP, Routing, Routers)': ['Kurose & Ross Ch. 4', 'IP Addressing and Subnetting', 'Routing Algorithms (RIP, OSPF, BGP)', 'How Routers Work'],
      'Transport Layer (TCP, UDP, Congestion Control)': ['Kurose & Ross Ch. 3', 'TCP Handshake Explained', 'UDP vs TCP', 'TCP Congestion Control Visualization'],
      'Application Layer (HTTP, DNS, SMTP)': ['Kurose & Ross Ch. 2', 'MDN HTTP Docs', 'How DNS Works (Cloudflare)', 'Email Protocols Explained'],
      'Network Security Basics': ['Kurose & Ross Ch. 8', 'Introduction to Firewalls', 'VPN Explained', 'SSL/TLS Handshake'],
      'Wireless & Mobile Networks': ['Kurose & Ross Ch. 6', 'How WiFi Works (802.11)', 'Cellular Network Generations (4G, 5G)'],
    }
  },
   'Machine Learning': {
    nodes: [
      { id: 'ml-1', data: { label: 'Introduction to ML & AI' } },
      { id: 'ml-2', data: { label: 'Python for ML (NumPy, Pandas, Matplotlib)' } },
      { id: 'ml-3', data: { label: 'Data Preprocessing & Feature Engineering' } },
      { id: 'ml-4', data: { label: 'Supervised Learning (Regression & Classification)' } },
      { id: 'ml-5', data: { label: 'Model Evaluation & Selection' } },
      { id: 'ml-6', data: { label: 'Unsupervised Learning (Clustering, Dimensionality Reduction)' } },
      { id: 'ml-7', data: { label: 'Introduction to Deep Learning (Neural Networks)' } },
      { id: 'ml-8', data: { label: 'ML Frameworks (Scikit-learn, TensorFlow/PyTorch)' } },
    ],
    edges: [
      { id: 'e-ml-1-2', source: 'ml-1', target: 'ml-2' },
      { id: 'e-ml-2-3', source: 'ml-2', target: 'ml-3' },
      { id: 'e-ml-3-4', source: 'ml-3', target: 'ml-4' },
      { id: 'e-ml-4-5', source: 'ml-4', target: 'ml-5' },
      { id: 'e-ml-3-6', source: 'ml-3', target: 'ml-6' }, // Can learn unsupervised after preprocessing
      { id: 'e-ml-6-5', source: 'ml-6', target: 'ml-5' }, // Evaluation applies here too
      { id: 'e-ml-5-7', source: 'ml-5', target: 'ml-7' }, // Intro to DL after basic model eval
      { id: 'e-ml-4-8', source: 'ml-4', target: 'ml-8' }, // Frameworks needed for implementation
      { id: 'e-ml-6-8', source: 'ml-6', target: 'ml-8' },
      { id: 'e-ml-7-8', source: 'ml-7', target: 'ml-8' },
    ],
    resources: {
      'Introduction to ML & AI': ['Andrew Ng Machine Learning Course (Coursera/Stanford)', 'Elements of AI (Free Course)', 'What is Machine Learning? (Google AI)'],
      'Python for ML (NumPy, Pandas, Matplotlib)': ['Python Data Science Handbook (Book/Online)', 'Kaggle Learn: Pandas', 'NumPy Docs', 'Matplotlib Tutorials'],
      'Data Preprocessing & Feature Engineering': ['Hands-On Machine Learning (Géron Book) Ch. 2', 'Scikit-learn Preprocessing Docs', 'Feature Engineering for ML (Coursera)'],
      'Supervised Learning (Regression & Classification)': ['Géron Book Ch. 4-8', 'Scikit-learn User Guide (Supervised)', 'StatQuest YouTube Channel', 'Common Classification Algorithms Explained'],
      'Model Evaluation & Selection': ['Scikit-learn Model Evaluation Docs', 'Cross-Validation Explained', 'Confusion Matrix', 'Bias-Variance Tradeoff'],
      'Unsupervised Learning (Clustering, Dimensionality Reduction)': ['Géron Book Ch. 9', 'Scikit-learn User Guide (Unsupervised)', 'K-Means Clustering Explained', 'PCA Explained (StatQuest)'],
      'Introduction to Deep Learning (Neural Networks)': ['DeepLearning.AI Specialization (Coursera)', '3Blue1Brown Neural Networks Series (YouTube)', 'Fast.ai Course'],
      'ML Frameworks (Scikit-learn, TensorFlow/PyTorch)': ['Scikit-learn Tutorials', 'TensorFlow Get Started', 'PyTorch Tutorials'],
    }
  },
   'Cloud Computing': {
    nodes: [
        { id: 'cc-1', data: { label: 'Cloud Concepts (IaaS, PaaS, SaaS, Models)' } },
        { id: 'cc-2', data: { label: 'Virtualization Fundamentals' } },
        { id: 'cc-3', data: { label: 'Core Compute Services (VMs, Containers)' } },
        { id: 'cc-4', data: { label: 'Core Storage Services (Object, Block, File)' } },
        { id: 'cc-5', data: { label: 'Cloud Networking (VPC, Subnets, Load Balancers)' } },
        { id: 'cc-6', data: { label: 'Cloud Databases (Managed SQL & NoSQL)' } },
        { id: 'cc-7', data: { label: 'Serverless Computing (FaaS)' } },
        { id: 'cc-8', data: { label: 'Identity & Access Management (IAM)' } },
        { id: 'cc-9', data: { label: 'Infrastructure as Code (IaC)' } },
        { id: 'cc-10', data: { label: 'Cloud Monitoring & Logging' } },
    ],
    edges: [
        { id: 'e-cc-1-2', source: 'cc-1', target: 'cc-2' },
        { id: 'e-cc-2-3', source: 'cc-2', target: 'cc-3' },
        { id: 'e-cc-1-4', source: 'cc-1', target: 'cc-4' },
        { id: 'e-cc-1-5', source: 'cc-1', target: 'cc-5' },
        { id: 'e-cc-3-6', source: 'cc-3', target: 'cc-6' }, // Need compute for DBs often
        { id: 'e-cc-4-6', source: 'cc-4', target: 'cc-6' }, // Need storage for DBs
        { id: 'e-cc-3-7', source: 'cc-3', target: 'cc-7' }, // Serverless builds on compute ideas
        { id: 'e-cc-1-8', source: 'cc-1', target: 'cc-8' }, // IAM is fundamental
        { id: 'e-cc-3-9', source: 'cc-3', target: 'cc-9' }, // IaC manages resources
        { id: 'e-cc-4-9', source: 'cc-4', target: 'cc-9' },
        { id: 'e-cc-5-9', source: 'cc-5', target: 'cc-9' },
        { id: 'e-cc-1-10', source: 'cc-1', target: 'cc-10' }, // Monitoring is fundamental
    ],
    resources: {
        'Cloud Concepts (IaaS, PaaS, SaaS, Models)': ['AWS Cloud Practitioner Essentials', 'Azure Fundamentals (AZ-900)', 'GCP Cloud Digital Leader', 'NIST Cloud Definition'],
        'Virtualization Fundamentals': ['What is Virtualization? (VMware)', 'Containers vs VMs (Docker)', 'Hypervisors Explained'],
        'Core Compute Services (VMs, Containers)': ['AWS EC2 Docs', 'Azure Virtual Machines Docs', 'GCP Compute Engine Docs', 'Docker Get Started', 'Kubernetes Basics'],
        'Core Storage Services (Object, Block, File)': ['AWS S3/EBS/EFS Docs', 'Azure Blob/Disk/Files Docs', 'GCP Cloud Storage/Persistent Disk/Filestore Docs'],
        'Cloud Networking (VPC, Subnets, Load Balancers)': ['AWS VPC Docs', 'Azure VNet Docs', 'GCP VPC Network Docs', 'Load Balancing Concepts'],
        'Cloud Databases (Managed SQL & NoSQL)': ['AWS RDS/DynamoDB Docs', 'Azure SQL Database/Cosmos DB Docs', 'GCP Cloud SQL/Firestore Docs'],
        'Serverless Computing (FaaS)': ['AWS Lambda Docs', 'Azure Functions Docs', 'GCP Cloud Functions Docs', 'Serverless Framework'],
        'Identity & Access Management (IAM)': ['AWS IAM Docs', 'Azure Active Directory Docs', 'GCP IAM Docs', 'Principle of Least Privilege'],
        'Infrastructure as Code (IaC)': ['Terraform Get Started', 'AWS CloudFormation Docs', 'Azure Resource Manager (ARM) Templates', 'Pulumi Docs'],
        'Cloud Monitoring & Logging': ['AWS CloudWatch Docs', 'Azure Monitor Docs', 'GCP Cloud Monitoring/Logging Docs', 'Prometheus & Grafana'],
    }
  },
   'Cybersecurity Fundamentals': {
    nodes: [
      { id: 'sec-1', data: { label: 'Core Security Concepts (CIA Triad)' } },
      { id: 'sec-2', data: { label: 'Threat Landscape & Actors' } },
      { id: 'sec-3', data: { label: 'Network Security Basics (Firewalls, IDS/IPS)' } },
      { id: 'sec-4', data: { label: 'Cryptography Basics (Symmetric, Asymmetric, Hashing)' } },
      { id: 'sec-5', data: { label: 'Web Security (OWASP Top 10)' } },
      { id: 'sec-6', data: { label: 'Malware Types & Analysis Intro' } },
      { id: 'sec-7', data: { label: 'Access Control & Authentication' } },
      { id: 'sec-8', data: { label: 'Security Operations (SOC) & Incident Response Intro' } },
      { id: 'sec-9', data: { label: 'Ethical Hacking & Pentesting Intro' } },
    ],
    edges: [
      { id: 'e-sec-1-2', source: 'sec-1', target: 'sec-2' },
      { id: 'e-sec-1-3', source: 'sec-1', target: 'sec-3' },
      { id: 'e-sec-1-4', source: 'sec-1', target: 'sec-4' },
      { id: 'e-sec-1-7', source: 'sec-1', target: 'sec-7' },
      { id: 'e-sec-3-5', source: 'sec-3', target: 'sec-5' }, // Web relies on network
      { id: 'e-sec-4-5', source: 'sec-4', target: 'sec-5' }, // Web relies on crypto (HTTPS)
      { id: 'e-sec-2-6', source: 'sec-2', target: 'sec-6' }, // Malware is a threat
      { id: 'e-sec-1-8', source: 'sec-1', target: 'sec-8' },
      { id: 'e-sec-3-9', source: 'sec-3', target: 'sec-9' }, // Pentesting needs network knowledge
      { id: 'e-sec-5-9', source: 'sec-5', target: 'sec-9' }, // Web pentesting
    ],
    resources: {
      'Core Security Concepts (CIA Triad)': ['CompTIA Security+ Study Guide (SY0-601/701)', 'CISSP Official Study Guide', 'NIST Glossary'],
      'Threat Landscape & Actors': ['Verizon Data Breach Investigations Report (DBIR)', 'MITRE ATT&CK Framework', 'Cyber Threat Actor Profiles (CrowdStrike/Mandiant)'],
      'Network Security Basics (Firewalls, IDS/IPS)': ['Professor Messer Security+ Videos', 'Palo Alto Networks Learning Center', 'Snort IDS/IPS Docs'],
      'Cryptography Basics (Symmetric, Asymmetric, Hashing)': ['Cryptography I (Coursera - Dan Boneh)', 'Serious Cryptography (Book)', 'Khan Academy Cryptography'],
      'Web Security (OWASP Top 10)': ['OWASP Top 10 Project', 'PortSwigger Web Security Academy', 'OWASP Testing Guide'],
      'Malware Types & Analysis Intro': ['Malwarebytes Blog', 'VirusTotal (Tool)', 'Practical Malware Analysis (Book)'],
      'Access Control & Authentication': ['NIST SP 800-63 Digital Identity Guidelines', 'Multi-Factor Authentication (MFA) Explained', 'Role-Based Access Control (RBAC)'],
      'Security Operations (SOC) & Incident Response Intro': ['SANS Reading Room (SOC/IR papers)', 'NIST SP 800-61 Incident Handling Guide', 'Introduction to SIEM Tools (Splunk/Elastic)'],
      'Ethical Hacking & Pentesting Intro': ['TryHackMe Learning Paths', 'Hack The Box Academy', 'Penetration Testing: A Hands-On Introduction (Book)'],
    }
  },
   'Mobile App Development (Android with Kotlin)': {
    nodes: [
      { id: 'and-1', data: { label: 'Kotlin Fundamentals' } },
      { id: 'and-2', data: { label: 'Android Studio & Project Structure' } },
      { id: 'and-3', data: { label: 'UI Design: Layouts & Views (XML)' } },
      { id: 'and-4', data: { label: 'UI Design: Jetpack Compose Basics' } },
      { id: 'and-5', data: { label: 'Activities & Lifecycles' } },
      { id: 'and-6', data: { label: 'Fragments & Navigation Component' } },
      { id: 'and-7', data: { label: 'RecyclerView & Adapters' } },
      { id: 'and-8', data: { label: 'Data Persistence (SharedPreferences, Room DB)' } },
      { id: 'and-9', data: { label: 'Networking (Retrofit/Ktor)' } },
      { id: 'and-10', data: { label: 'Background Work (Coroutines, WorkManager)' } },
    ],
    edges: [
      { id: 'e-and-1-2', source: 'and-1', target: 'and-2' },
      { id: 'e-and-2-3', source: 'and-2', target: 'and-3' },
      { id: 'e-and-2-4', source: 'and-2', target: 'and-4' }, // Can learn Compose alongside/instead of XML
      { id: 'e-and-2-5', source: 'and-2', target: 'and-5' },
      { id: 'e-and-5-6', source: 'and-5', target: 'and-6' },
      { id: 'e-and-3-7', source: 'and-3', target: 'and-7' }, // RecyclerView needs basic layout knowledge
      { id: 'e-and-4-7', source: 'and-4', target: 'and-7' }, // Compose has LazyColumn/Row
      { id: 'e-and-1-8', source: 'and-1', target: 'and-8' }, // Persistence needs Kotlin basics
      { id: 'e-and-1-9', source: 'and-1', target: 'and-9' }, // Networking needs Kotlin basics
      { id: 'e-and-1-10', source: 'and-1', target: 'and-10' }, // Coroutines are Kotlin feature
      { id: 'e-and-5-10', source: 'and-5', target: 'and-10' }, // Background work relates to lifecycle
    ],
    resources: {
      'Kotlin Fundamentals': ['Kotlin Official Docs', 'Kotlin Koans', 'Head First Kotlin (Book)'],
      'Android Studio & Project Structure': ['Android Developers: Meet Android Studio', 'Android Basics in Kotlin (Google Course)', 'Project Structure Overview'],
      'UI Design: Layouts & Views (XML)': ['Android Developers: Layouts', 'View / ViewGroup Concepts', 'Material Design Components for Android'],
      'UI Design: Jetpack Compose Basics': ['Android Developers: Jetpack Compose Pathway', 'Compose Basics Codelab', 'Thinking in Compose'],
      'Activities & Lifecycles': ['Android Developers: Activities', 'Activity Lifecycle Explained', 'Handling Configuration Changes'],
      'Fragments & Navigation Component': ['Android Developers: Fragments', 'Navigation Component Codelab', 'Passing Data Between Fragments'],
      'RecyclerView & Adapters': ['Android Developers: RecyclerView', 'Implementing RecyclerView Adapters', 'ViewHolder Pattern'],
      'Data Persistence (SharedPreferences, Room DB)': ['Android Developers: Data Storage Overview', 'Room Codelab', 'SharedPreferences Guide'],
      'Networking (Retrofit/Ktor)': ['Retrofit Official Site', 'Ktor Client Docs', 'Making Network Requests (Android Guide)'],
      'Background Work (Coroutines, WorkManager)': ['Kotlin Coroutines on Android', 'WorkManager Codelab', 'Threading on Android'],
    }
  }
};

// console.log(JSON.stringify(syllabusData, null, 2)); // Optional: Print nicely formatted JSON

dagreGraph.setDefaultEdgeLabel(() => ({}));



// --- Layout Logic (Keep layoutNodes function as is) ---
const nodeWidth = 180; // Default width
const nodeHeight = 60; // Default height

const layoutNodes = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const width = node.width || nodeWidth;
    const height = node.height || nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width || nodeWidth;
    const height = node.height || nodeHeight;

    if (!nodeWithPosition) {
        console.warn(`Node ${node.id} not found in Dagre graph after layout.`);
        return {
            ...node,
            position: { x: Math.random() * 500, y: Math.random() * 300 },
            sourcePosition: direction === 'LR' ? 'right' : 'bottom',
            targetPosition: direction === 'LR' ? 'left' : 'top',
        };
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      targetPosition: direction === 'LR' ? 'left' : 'top',
      style: {
          width: `${width}px`,
          height: `${height}px`,
      }
    };
  });
};


// --- ResourceModal Component (Updated for Centering) ---
const ResourceModal = ({ topic, resources, onClose }) => { // Removed 'position' prop
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85 }, // Only animate opacity and scale
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
  };

  return (
    // Added centering classes: top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
    <motion.div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-xl shadow-2xl w-[90vw] max-w-lg z-50 p-5 pointer-events-auto flex flex-col" // Added flex flex-col, max-w-lg, w-[90vw]
      style={{ maxHeight: '85vh' }} // Set max height
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={handleModalClick}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate pr-2">📘 {topic} Resources</h3>
        <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-2xl leading-none p-1 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
        >
            &times;
        </button>
      </div>

      {/* Content Area (Scrollable) */}
      <div className="overflow-y-auto flex-grow pr-1">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {(resources || []).length > 0 ? (
            resources.map((res, idx) => (
              <li key={idx} className="text-sm break-words leading-relaxed">
                {typeof res === 'string' && (res.startsWith('http') || res.startsWith('www.')) ? (
                   <a
                      href={res.startsWith('www.') ? `https://${res}` : res}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-800"
                   >
                      {res}
                   </a>
                ) : (
                   res
                )}
              </li>
            ))
          ) : (
            <li className="text-sm italic text-gray-500">No resources listed for this topic.</li>
          )}
        </ul>
      </div>
    </motion.div>
  );
};


// --- SyllabusPage Component (Main Component - Updated) ---
const SyllabusPage = () => {
  const reactFlowWrapper = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState(Object.keys(syllabusData)[0]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  // const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 }); // REMOVED
  const [modalResources, setModalResources] = useState([]);

  useEffect(() => {
    const subjectData = syllabusData[selectedSubject];
    if (!subjectData) {
        console.error(`No data found for subject: ${selectedSubject}`);
        setNodes([]);
        setEdges([]);
        return;
    }
    const nodesToLayout = Array.isArray(subjectData.nodes) ? subjectData.nodes : [];
    const edgesToLayout = Array.isArray(subjectData.edges) ? subjectData.edges : [];

    // console.log(`Laying out ${nodesToLayout.length} nodes for ${selectedSubject}`);
    try {
        const laidOutNodes = layoutNodes(nodesToLayout, edgesToLayout, 'TB');
        setNodes(laidOutNodes);
        setEdges(edgesToLayout);
        setSelectedTopic(null);
    } catch (error) {
        console.error("Error during graph layout:", error);
        setNodes(nodesToLayout.map(n => ({ ...n, position: { x: Math.random() * 500, y: Math.random() * 300 } })));
        setEdges(edgesToLayout);
    }
  }, [selectedSubject, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Updated onNodeClick - no position calculation/setting needed
  const onNodeClick = useCallback((event, node) => {
    const topicLabel = node.data.label;
    const resources = syllabusData[selectedSubject]?.resources?.[topicLabel] || [];

    setSelectedTopic(topicLabel);
    setModalResources(resources);
    // No need to setModalPosition
  }, [selectedSubject]); // Keep dependency

  const onPaneClick = useCallback(() => {
      setSelectedTopic(null);
  }, []);

  return (
    <div ref={reactFlowWrapper} className="w-full h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-slate-100 p-4 flex flex-col">
      {/* Header Section */}
      <div className="mb-4 flex items-center gap-3 flex-wrap border-b pb-3 border-gray-200">
        <label htmlFor="subject-select" className="text-base font-medium text-gray-700 whitespace-nowrap">
          📚 Select Subject:
        </label>
        <select
          id="subject-select"
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-sm min-w-[200px]"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {Object.keys(syllabusData).map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-auto pl-4 whitespace-nowrap">
           {selectedSubject} Learning Path
        </h2>
      </div>

      {/* React Flow Section */}
      <div className="flex-grow relative rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
        >
          <MiniMap nodeStrokeWidth={3} nodeColor="#a0a0a0" maskColor="#f0f0f0" />
          <Controls />
          <Background variant="dots" gap={18} size={0.7} color="#d0d0d0" />
        </ReactFlow>
      </div>

      {/* Modal Section (Updated invocation - no position prop) */}
      <AnimatePresence>
        {selectedTopic && (
          <ResourceModal
            key={selectedTopic}
            topic={selectedTopic}
            resources={modalResources}
            // No position prop passed
            onClose={() => setSelectedTopic(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Export the component
export default SyllabusPage;