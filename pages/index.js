import Head from "next/head";
import { Accordion, Card } from "react-bootstrap";
import { URL } from "../common";

export default function Home({ data }) {
  let result = [];
  if (process.browser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    Array.from(doc.querySelectorAll("h2")).forEach((i) => {
      const text = i.textContent;
      const isTextValid = !(
        i.textContent.includes("Conc") || i.textContent.includes("Whol")
      );
      if (isTextValid) {
        let loop = true;
        let siblings = [];
        let nextSibling = i.nextElementSibling;
        while (loop) {
          if (
            nextSibling.nodeName === "DIV" &&
            nextSibling.className === "youtube-responsive-container"
          ) {
            const hyperlink = document.createElement("a");
            hyperlink.setAttribute(
              "href",
              nextSibling.querySelector("iframe").getAttribute("data-ezsrc")
            );
            hyperlink.setAttribute("target", "_blank");
            hyperlink.setAttribute("rel", "noopener noreferrer");
            hyperlink.textContent = "View Lecture on YouTube";
            hyperlink.classList.add("d-none", "youtube");
            siblings.push(hyperlink);
          } else {
            if (
              nextSibling.nodeName !== "DIV" &&
              nextSibling.innerHTML !== "" &&
              nextSibling.innerHTML !== "&nbsp;" &&
              !nextSibling.innerHTML.includes(" -->&nbsp;") &&
              !nextSibling.innerHTML.includes("</span>&nbsp;")
            ) {
              if (
                nextSibling.nodeName === "P" ||
                nextSibling.nodeName === "UL" ||
                (nextSibling.nodeName === "OL" &&
                  nextSibling.querySelector("h3") === null)
              ) {
                nextSibling.classList.add("d-none");
              }
              siblings.push(nextSibling);
            }
          }
          nextSibling = nextSibling.nextElementSibling;
          if (nextSibling.nodeName === "H2") {
            loop = false;
          }
        }
        siblings = siblings
          .map((i) => {
            if (i.outerHTML !== "<p></p>" && i.outerHTML !== "<p>&nbsp;</p>") {
              return i.outerHTML;
            }
          })
          .join("");
        result.push({
          title: text.replace(/.*:\s/, ""),
          siblings,
        });
      }
    });
    document.addEventListener("click", (e) => {
      const node = e.target.nodeName;
      if (node === "H3" || node === "STRONG") {
        let loop = true;
        let siblings = [];
        let nextSibling =
          node === "STRONG"
            ? e.target.parentElement.parentElement.parentElement
                .nextElementSibling
            : e.target.parentElement.parentElement.nextElementSibling;
        while (loop) {
          siblings.push(nextSibling);
          if (nextSibling === null) {
            loop = false;
          } else if (nextSibling.nextElementSibling === null) {
            loop = false;
          } else {
            nextSibling = nextSibling.nextElementSibling;
            if (
              nextSibling.nodeName === "OL" &&
              nextSibling.getAttribute("start")
            ) {
              loop = false;
            }
          }
        }
        siblings.forEach((i) => {
          // foo
          i.classList.toggle("d-none");
        });
      }
    });
  }
  return (
    <div className="p-3 min-vh-100">
      <Head>
        <title>CS1000</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center mb-3">
        <h1 className="text-white">CS1000</h1>
      </div>
      <Accordion>
        {result.map((i, index) => (
          <Card key={index} bg="dark" text="secondary">
            <Accordion.Toggle
              as={Card.Header}
              variant="link"
              eventKey={index.toString()}
            >
              <div className="title">{i.title}</div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={index.toString()}>
              <div
                dangerouslySetInnerHTML={{ __html: i.siblings }}
                className="siblings"
              ></div>
            </Accordion.Collapse>
          </Card>
        ))}
      </Accordion>
      <div className="text-center my-3 d-flex justify-content-center">
        <a
          href="https://laconicml.com/computer-science-curriculum-youtube-videos/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reference
        </a>
        <a
          href="https://github.com/tpkahlon/cs1000"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3"
        >
          Source
        </a>
      </div>
    </div>
  );
}

Home.getInitialProps = async () => {
  const r = await fetch(URL);
  const j = await r.text();
  return {
    data: j,
  };
};
