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
      <CardContent className="p-6">
        <div className="help-article-content" dangerouslySetInnerHTML={createMarkup()} />
      </CardContent>
    </Card>
  );
}

export default HelpArticle;
