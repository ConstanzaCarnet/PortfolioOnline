namespace PortfolioApi.Models;

public record TranslatedText(string Es, string En);
public record TranslatedList(string[] Es, string[] En);

public record Project(
    string Title,
    bool Featured,
    TranslatedText Description,
    TranslatedList Highlights,
    string Stack,
    string Link
);

public record Experience(
    TranslatedText Role,
    TranslatedText Company,
    TranslatedText Period,
    TranslatedText Description,
    string Skills
);

public record PortfolioDataResponse(
    Project[] Projects,
    Experience[] Experiences
);
