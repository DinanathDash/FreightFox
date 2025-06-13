import { Card, CardContent } from "../../Components/ui/card";
import { marked } from "marked";
import "./HelpPage.css";

function HelpArticle({ article }) {
  if (!article) return null;

  const createMarkup = () => {
    return { __html: marked(article.content) };
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{article.title}</h1>
        <div className="help-article-content text-sm sm:text-base" dangerouslySetInnerHTML={createMarkup()} />
      </CardContent>
    </Card>
  );
}

export default HelpArticle;
