import { createWebAgentAPI } from "@/main";

const companies = [
  {
    Name: "3M Company",
    Sector: "Industrials",
    Symbol: "MMM",
    Contact: "Nick Kolba",
    Email: "nkolba@gmail.com"
  },
  {
    Name: "A.O. Smith Corp",
    Sector: "Industrials",
    Symbol: "AOS",
    Contact: "Seb Ben M'Barek",
    Email: "sebastien.benmbarek@normanandsons.com"
  },
  {
    Name: "Abbott Laboratories",
    Sector: "Health Care",
    Symbol: "ABT",
    Contact: "Rob Moffat",
    Email: "rob.moffat@hsbc.com"
  },
  {
    Name: "AbbVie Inc.",
    Sector: "Health Care",
    Symbol: "ABBV",
    Contact: "Nick Kolba",
    Email: "nkolba@gmail.com"
  },
  {
    Name: "Abiomed",
    Sector: "Health Care",
    Symbol: "ABMD",
    Contact: "Nick Kolba",
    Email: "nkolba@gmail.com"
  },
  {
    Name: "Accenture plc",
    Sector: "Information Technology",
    Symbol: "ACN",
    Contact: "Nick Kolba",
    Email: "nkolba@gmail.com"
  },
  {
    Name: "Activision Blizzard",
    Sector: "Information Technology",
    Symbol: "ATVI",
    Contact: "Rob Moffat",
    Email: "rob.moffat@hsbc.com"
  },
  {
    Name: "ADM",
    Sector: "IConsumer Staples",
    Symbol: "ADM",
    Contact: "Nick Kolba",
    Email: "nkolba@gmail.com"
  },
  {
    Name: "Adobe Systems Inc",
    Sector: "Information Technology",
    Symbol: "ADBE",
    Contact: "Seb Ben M'Barek",
    Email: "sebastien.benmbarek@normanandsons.com"
  },
  {
    Name: "Advance Auto Parts",
    Sector: "Consumer Discretionary",
    Symbol: "AAP",
    Contact: "Seb Ben M'Barek",
    Email: "sebastien.benmbarek@normanandsons.com"
  }
];

export const createComponent = async (target: HTMLElement) => {
  const render = async (target: HTMLElement) => {
    const componentWrapper = document.createElement("div");

    const header = document.createElement("div");
    header.classList.add("header");
    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = "App";
    const channelPicker = document.createElement("div");
    channelPicker.id = "channelPicker";
    header.appendChild(title);
    header.appendChild(channelPicker);

    const channels = await fdc3.getSystemChannels();

    channels.forEach(channel => {
      const option = document.createElement("div");
      option.classList.add("channel");
      option.style.background =
        channel.id === "global" ? "#999" : channel.displayMetadata?.color || "";
      option.title = channel.id === "global" ? "no channel" : channel.id;
      if (channel.id === "global") {
        option.textContent = "X";
      }
      option.addEventListener("click", async () => {
        if (channel.id === "global") {
          await fdc3.leaveCurrentChannel();
        }
        document
          .querySelectorAll(".channel")
          .forEach(c => (c.textContent = ""));
        option.textContent = "X";

        await fdc3.joinChannel(channel.id);
      });
      channelPicker.appendChild(option);
    });

    componentWrapper.appendChild(header);

    const description = document.createElement("p");
    description.textContent =
      "This is a demo of a portal app using in line components all in the same DOM but with different FDC3 scopes";

    componentWrapper.appendChild(description);

    const broadcastSection = document.createElement("div");
    broadcastSection.classList.add("section");
    const broadcastHeader = document.createElement("h2");
    broadcastHeader.textContent = "broadcast";
    const broadcastButtonsContainer = document.createElement("div");
    broadcastButtonsContainer.id = "broadcastButtons";
    broadcastButtonsContainer.classList.add("buttonContainer");
    const contextHeader = document.createElement("h2");
    contextHeader.textContent = "context";
    const contextFieldWrapper = document.createElement("div");
    contextFieldWrapper.classList.add("contextField");
    const contextField = document.createElement("pre");
    contextField.id = "contextField";
    contextFieldWrapper.appendChild(contextField);

    fdc3.addContextListener("fdc3.instrument", context => {
      contextField.textContent = `${JSON.stringify(context)}\n${
        contextField.textContent
      }`;
    });

    companies.forEach(company => {
      const button = document.createElement("button");
      button.textContent = company.Name;
      button.addEventListener("click", () => {
        fdc3.broadcast({
          type: "fdc3.instrument",
          name: company.Name,
          id: {
            ticker: company.Symbol
          }
        });
      });
      broadcastButtonsContainer.appendChild(button);
    });

    broadcastSection.appendChild(broadcastHeader);
    broadcastSection.appendChild(broadcastButtonsContainer);
    broadcastSection.appendChild(contextHeader);
    broadcastSection.appendChild(contextFieldWrapper);

    componentWrapper.appendChild(broadcastSection);

    const intentsSection = document.createElement("div");
    intentsSection.classList.add("section");
    const intentsHeader = document.createElement("h2");
    intentsHeader.textContent = "intents";
    const intentsButtonsContainer = document.createElement("div");
    intentsButtonsContainer.id = "intentButtons";
    intentsButtonsContainer.classList.add("buttonContainer");
    const intentsContextHeader = document.createElement("h2");
    intentsContextHeader.textContent = "intents for context";
    const intentsContextButtonsContainer = document.createElement("div");
    intentsContextButtonsContainer.id = "intentContextButtons";
    intentsContextButtonsContainer.classList.add("buttonContainer");

    companies.forEach(company => {
      const intentButton = document.createElement("button");
      const intentContextButton = document.createElement("button");
      intentButton.textContent = company.Name;
      intentContextButton.textContent = company.Name;

      intentContextButton.addEventListener("click", () => {
        fdc3.raiseIntentForContext({
          type: "fdc3.instrument",
          id: { ticker: company.Symbol }
        });
      });

      intentButton.addEventListener("click", () => {
        fdc3.raiseIntent("ViewChart", {
          type: "fdc3.instrument",
          id: { ticker: company.Symbol }
        });
      });

      intentsButtonsContainer.appendChild(intentButton);
      intentsContextButtonsContainer.appendChild(intentContextButton);
    });

    intentsSection.appendChild(intentsHeader);
    intentsSection.appendChild(intentsButtonsContainer);
    intentsSection.appendChild(intentsContextHeader);
    intentsSection.appendChild(intentsContextButtonsContainer);

    componentWrapper.appendChild(intentsSection);

    target.appendChild(componentWrapper);
  };

  const fdc3 = await createWebAgentAPI();

  render(target);
};
