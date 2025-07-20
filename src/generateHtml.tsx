import * as React from "react";
import { renderToString } from "react-dom/server";
import resume from "../resume.json";
import { getWebsiteIcon } from "./generateMarkdown";

// import * as styles from "./style.module.css";

type IResume = typeof resume;

export const generateHtml = async () => {
	const res = await Bun.build({
		minify: true,
		entrypoints: [__dirname + "/style.css"],
	});
	const cssContent = await res.outputs[0].text();

	const logos = await Promise.all(
		[...resume.work.map((w) => w.url), ...resume.education.map((w) => w.url)]
			.filter((url) => url !== undefined)
			.map(async (url) => [url, await getWebsiteIcon(url)]),
	).then(Object.fromEntries);

	// remove irrelevant xp
	resume.work = resume.work.filter(
		(w) => !w.name.toLocaleLowerCase().match(/(hola|mushin|arthur)/),
	);

	const resumeContent = renderToString(
		<Resume resume={resume} logos={logos} />,
	);

	return (
		"<!doctype html>" +
		renderToString(<Html content={resumeContent} css={cssContent} />).replace(
			/<body>/,
			`<body><button id="fit-to-print" onclick="${fnBody.replaceAll('"', `'`)}">fit to print</button>`,
		)
	);
};


const Html = ({ content, css }: { content: string; css: string }) => (
	<html lang="en">
		<head>
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<style dangerouslySetInnerHTML={{ __html: css }} />
			<title>Aravindh Resume</title>
			<link
				href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
				rel="stylesheet"
			/>
		</head>
		<body dangerouslySetInnerHTML={{ __html: content }} />
	</html>
);

const ShortUrl = ({
	href,
	...props
}: { href: string } & React.ComponentProps<"a">) => {
	const u = new URL(href);
	const short = u.hostname + (u.pathname !== "/" ? u.pathname : "");

	return (
		<a {...props} href={u.href}>
			{short}
		</a>
	);
};

const dateFmt = (s: string) => {
	const d = new Date(s);

	return (d.getMonth() + 1).toString().padStart(2, "0") + "/" + d.getFullYear();
};

const Resume = ({
  resume,
  logos,
}: {
  resume: IResume;
  logos: Record<string, string>;
}) => (
  <>
    <section id="basics">
      <h1>
        {resume.basics.name} | {resume.basics.label}
      </h1>
      <address>
        <ShortUrl href={resume.basics.url} />
        {" · "}
        <ShortUrl href={resume.basics.profiles[0].url} />
        {" · "}
        <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a>
      </address>
      <blockquote>{resume.basics.summary}</blockquote>
    </section>

    <section id="work">
      <h2>Work</h2>
      <ul>
        {resume.work.map((w, index) => (
          <li key={w.name + index}>
            <header>
              {logos[w.url] && (
                <img className="logo" alt="logo" src={logos[w.url]} />
              )}
              <h3>{w.name}</h3>
              {w.location && <address>{w.location}</address>}
              <span className="date">
                {" "}
                {dateFmt(w.startDate)} - {w.endDate ? dateFmt(w.endDate) : "present"}
              </span>
            </header>
            <div>
              <p>{w.summary}</p>
              <ul>
                {w.highlights.map((h, i) => (
                  <li key={`highlight-${index}-${i}`}>{h}</li>
                ))}
              </ul>
              <ul className="tag-list">
                {w.skills.map((s, i) => (
                  <li key={`skill-${index}-${i}`}>{s}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section id="education">
      <h2>Education</h2>
      <ul>
        {resume.education.map((e, index) => (
          <li key={e.institution + index}>
            <header>
              {logos[e.url] && (
                <img className="logo" alt="logo" src={logos[e.url]} />
              )}
              <h3>{e.institution}</h3>
              <span className="date">
                {" "}
                {new Date(e.startDate).getFullYear()}
                {" - "}
                {new Date(e.endDate).getFullYear()}
              </span>
            </header>
            <div>
              {e.studyType} | {e.area}
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section id="skills">
      <h2>Skills</h2>
      <ul>
        {resume.skills.map((s, index) => (
          <li key={s.name + index}>
            <header>
              <h3>{s.name}</h3>
            </header>
            <div>
              <ul className="tag-list">
                {s.keywords.map((k, i) => (
                  <li key={`keyword-${index}-${i}`}>{k}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <ul>
        {resume.projects.map((p, index) => (
          <li key={p.name + index}>
            <header>
              <h3>{p.name}</h3> <ShortUrl href={p.url} />
            </header>
            <div>
              <p>{p.summary}</p>
              <ul className="tag-list">
                {p.skills.slice(0, 4).map((s, i) => (
                  <li key={`proj-skill-${index}-${i}`}>{s}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </>
);

const fnBody = function () {
	const html = document.body.parentElement;
	html.style.height = "29.7cm";
	html.style.width = "24.2cm";
	const { height: htmlHeight } = html.getBoundingClientRect();

	html.style.height = "auto";

	let a = 0.1;
	let b = 1;

	for (let k = 16; k--; ) {
		const e = (a + b) / 2;

		html.style.fontSize = `${e}em`;
		const { height: bodyHeight } = document.body.getBoundingClientRect();

		if (bodyHeight > htmlHeight) b = e;
		else a = e;
	}

	html.style.fontSize = `${a}em`;
	html.style.width = "auto";
}
	.toString()
	.slice(12, -1)
	.trim();
