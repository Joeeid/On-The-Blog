import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const saltRounds = 10;
const username = "admin";
const password = "password";
let hashedPassword;
let loggedIn = false;
const blogs = [];

// Function to hash the password
const hashPassword = async () => {
	try {
		hashedPassword = await bcrypt.hash(password, saltRounds);
		console.log("Password hashed successfully");
	} catch (error) {
		console.error("Error hashing password:", error);
	}
};

// Middleware and routes
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	if (!loggedIn) {
		res.render("login.ejs");
	} else {
		res.render("index.ejs", {
			blogs: blogs,
		});
	}
});

app.get("/blog", (req, res) => {
	if (!loggedIn) {
		res.render("login.ejs");
	} else {
		res.render("blogpost.ejs", {
			button: "Back",
			link: "/",
		});
	}
});

app.post("/saveBlog", (req, res) => {
	if (!loggedIn) {
		res.render("login.ejs");
	} else {
		if (req.body["blogIndex"] !== "") {
			blogs[req.body["blogIndex"]] = req.body["description"];
		} else {
			blogs.push(req.body["description"]);
		}
		res.render("index.ejs", {
			blogs: blogs,
		});
	}
});

app.post("/deleteBlog", (req, res) => {
	if (!loggedIn) {
		res.render("login.ejs");
	} else {
		blogs.splice(req.body["blogIndex"], 1);
		res.render("index.ejs", {
			blogs: blogs,
		});
	}
});

app.post("/updateBlog", (req, res) => {
	if (!loggedIn) {
		res.render("login.ejs");
	} else {
		var blogIndex = req.body["blogIndex"];
		res.render("blogpost.ejs", {
			button: "Back",
			link: "/",
			blogIndex: blogIndex,
			blogDesc: blogs[blogIndex],
		});
	}
});

app.post("/", async (req, res) => {
	const pUsername = req.body["username"];
	const pPassword = req.body["password"];

	if (pUsername === username) {
		try {
			const result = await bcrypt.compare(pPassword, hashedPassword);
			if (result) {
				loggedIn = true;
				res.render("index.ejs", {
					blogs: blogs,
				});
				return;
			}
		} catch (error) {
			console.error("Error comparing passwords:", error);
		}
	}

	res.render("login.ejs", {
		error: "Incorrect username or password.",
	});
});

app.post("/logout", (req, res) => {
	loggedIn = false;
	res.render("login.ejs");
});

// Start the server after hashing the password
hashPassword().then(() => {
	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
});
