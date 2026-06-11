const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("hireloop");
    const jobCollection = db.collection("jobs");
    const companyCollection = db.collection("companyCollection");
    const usersCollection = db.collection("user");
    const applicationsCollection = db.collection("applications");
    const planCollection = db.collection("plans");
    const subscriptionCollection = db.collection("subscriptions");
    // jobs related api
    app.get("/api/jobs", async (req, res) => {
      const query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = await jobCollection.find(query);
      const result = await cursor.toArray();
      res.json({ success: true, result });
    });

    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date(),
      };
      const result = await jobCollection.insertOne(newJob);
      res.json({ success: true, result });
    });

    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.json(result);
    });

    // application related api
    app.get("/api/applications", async (req, res) => {
      console.log("this is applicant id form client:", req.query.applicantId);
      const query = {};
      if (req.query.applicantId) {
        query.applicantId = req.query.applicantId;
      }
      if (req.query.jobId) {
        query.jobId = req.query.jobId;
      }
      const result = await applicationsCollection.find(query).toArray();
      res.json({ success: true, result });
    });
    app.post("/api/applications", async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date(),
      };
      const result = await applicationsCollection.insertOne(newApplication);
      res.json({ success: true, result });
    });

    // company's API
    app.get("/api/companies", async (req, res) => {
      const cursor = companyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/my/companies", async (req, res) => {
      const query = {};

      if (req.query.recruiterId) {
        query.recruiterId = req.query.recruiterId;
      }
      const result = await companyCollection.findOne(query);
      res.json({ success: true, result });
    });

    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date(),
      };
      const result = await companyCollection.insertOne(newCompany);
      res.json({ success: true, result });
    });

    // plans
    app.get("/api/plans", async (req, res) => {
      console.log("this is plan name: form backend:", req.query.planId);
      const query = {};
      if (req.query.planId) {
        query.planName = req.query.planId;
      }
      const result = await planCollection.findOne(query);
      res.json({ success: true, result });
    });

    //subscription related api
    app.post("/api/subscriptions", async (req, res) => {
      const data = req.body;
      const subsInfo = {
        ...data,
        createdAt: new Date(),
      };
      const result = await subscriptionCollection.insertOne(subsInfo);
      // update the user information
      const filter = { email: data.email };
      const updateDocument = {
        $set: {
          plan: data.planId,
        },
      };
      const updateResult = await usersCollection.updateOne(
        filter,
        updateDocument,
      );
      res.json({ success: true, updateResult });
      res.json({
        success: true,
        message: "subscription inserted successfully!",
        result,
      });
    });

    app.patch("/api/companies/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCompany = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: updatedCompany.status,
        },
      };
      const result = await companyCollection.updateOne(filter, updatedDoc);
      res.json({ success: true, result });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
