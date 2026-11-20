import Image from "next/image";
import Link from "next/link";
import { SiteNavigation } from "@/app/components/site-navigation";
import { catalogProductHref, readPublicCatalog } from "@/lib/catalog/service";
import type { PublicCatalogProduct } from "@/lib/catalog/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function HomeProductCard({ product }: { product: PublicCatalogProduct }) {
  const image = product.photos[0];
  const href = catalogProductHref(product.slug, "pt-BR");

  return (
    <article className="catalog-card">
      <Link className="catalog-card-image" href={href}>
        {image ? (
          <Image
            src={image.url}
            alt={image.altText}
            fill
            unoptimized={
              image.url.startsWith("http://127.0.0.1:") || image.url.startsWith("http://localhost:")
            }
            sizes="280px"
          />
        ) : (
          <span aria-hidden="true">Imagem não cadastrada</span>
        )}
      </Link>
      <div className="catalog-card-content">
        <p className="catalog-card-category">{product.category}</p>
        <h2 className="catalog-card-title">
          <Link href={href}>{product.name}</Link>
        </h2>
        <p className="catalog-card-copy">{product.description || "Descrição não disponível."}</p>
        <p className="catalog-card-price">{formatPrice(product.priceBrl)}</p>
        <p className="catalog-card-availability">Disponível</p>
        {product.lowStockAlert && (
          <p className="catalog-low-stock-alert" role="status">
            Últimas unidades disponíveis.
          </p>
        )}
        <Link className="catalog-detail-link" href={href}>
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

function BotanicalEngraving() {
  return (
    <svg
      aria-hidden="true"
      className="home-botanical"
      fill="none"
      focusable="false"
      viewBox="0 0 420 520"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M218 500C205 423 226 362 198 295c-24-58-26-112-8-187" strokeWidth="2" />
        <path
          d="M207 408c-64-19-98-63-119-126 62 12 103 44 119 126ZM205 350c45-48 89-66 145-60-34 50-79 72-145 60ZM195 265c-46-34-69-73-70-121 48 26 73 65 70 121ZM193 207c35-42 71-59 116-54-26 42-65 62-116 54Z"
          strokeWidth="1.6"
        />
        <path
          d="M185 150c-9-29-3-53 19-73 22 20 28 44 19 73 28-13 51-8 69 16-24 17-48 18-72 3 10 30 4 54-19 72-22-21-27-45-16-73-26 15-50 12-71-9 22-21 45-24 71-9Z"
          strokeWidth="1.8"
        />
        <path
          d="M202 166c8-9 16-9 24 0-8 9-16 9-24 0ZM105 282l-15-19m117 140 17-22m111-82 18-17M129 144l-17-10m198 18 19-9"
          strokeWidth="1.4"
        />
        <path d="M216 488c-20 10-38 10-55 1m55 0c17 10 35 11 53 3" strokeWidth="1.5" />
      </g>
      <g fill="currentColor" opacity=".72">
        <circle cx="195" cy="78" r="2.3" />
        <circle cx="223" cy="78" r="2.3" />
        <circle cx="183" cy="151" r="2" />
        <circle cx="251" cy="151" r="2" />
      </g>
    </svg>
  );
}

function DividerFlower() {
  return (
    <svg aria-hidden="true" className="home-divider-flower" focusable="false" viewBox="0 0 40 40">
      <path
        d="M20 3c4 5 5 9 0 14-5-5-4-9 0-14Zm17 17c-5 4-9 5-14 0 5-5 9-4 14 0ZM20 37c-4-5-5-9 0-14 5 5 4 9 0 14ZM3 20c5-4 9-5 14 0-5 5-9 4-14 0Zm13 0c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default async function Home() {
  let products: PublicCatalogProduct[] = [];
  let catalogUnavailable = false;
  try {
    products = (await readPublicCatalog(await getSupabaseServerClient(), {}, "pt-BR")).slice(0, 4);
  } catch {
    catalogUnavailable = true;
  }

  const collections = [
    { number: "I", name: "Buquês", detail: "Flores reunidas em composição" },
    { number: "II", name: "Arranjos", detail: "Composições para a casa" },
    { number: "III", name: "Plantas", detail: "Verdes para cultivar" },
    { number: "IV", name: "Jardim", detail: "Objetos e cuidados" },
  ];

  return (
    <main className="home-page">
      <div className="home-announcement">
        <DividerFlower />
        <span>Catálogo floral · retirada presencial</span>
        <DividerFlower />
      </div>
      <div className="home-frame">
        <SiteNavigation home />

        <section aria-labelledby="home-title" className="home-hero">
          <div className="home-copy">
            <p className="home-kicker">FLORICULTURA · FLORES · JARDIM</p>
            <h1 id="home-title">
              Um espaço <em>para florescer.</em>
            </h1>
            <p className="home-lede">
              Flores, plantas, arranjos e objetos de jardinagem — reunidos em um catálogo feito para
              ser explorado sem pressa.
            </p>
            <div className="home-actions">
              <Link className="home-primary-link" href="/catalog">
                Explorar o catálogo <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-secondary-link" href="/auth">
                Entrar ou criar conta
              </Link>
            </div>
            <p className="home-note">Retirada presencial · Pagamento combinado pelo WhatsApp</p>
          </div>

          <div aria-hidden="true" className="home-illustration">
            <span className="home-illustration-caption">HERBÁRIO · PRANCHA I</span>
            <BotanicalEngraving />
            <span className="home-illustration-number">ROSA · FOLHA · LUA</span>
          </div>
          <span aria-hidden="true" className="home-side-mark">
            FLOR DA MEIA-NOITE
          </span>
        </section>

        <div aria-hidden="true" className="home-divider">
          <span />
          <DividerFlower />
          <span />
        </div>

        <section aria-label="Sobre a loja" className="home-services">
          <article>
            <DividerFlower />
            <div>
              <h2>Retirada presencial</h2>
              <p>Combine o horário após o pedido.</p>
            </div>
          </article>
          <article>
            <DividerFlower />
            <div>
              <h2>Pedido acompanhado</h2>
              <p>Confira o andamento na sua conta.</p>
            </div>
          </article>
          <article>
            <DividerFlower />
            <div>
              <h2>Conversa pelo WhatsApp</h2>
              <p>Pagamento e combinações são tratados com a loja.</p>
            </div>
          </article>
          <article>
            <DividerFlower />
            <div>
              <h2>Catálogo em quatro idiomas</h2>
              <p>Com português como idioma de origem.</p>
            </div>
          </article>
        </section>

        <section aria-labelledby="collections-title" className="home-collections" id="colecoes">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">EXPLORE O CATÁLOGO</p>
              <h2 id="collections-title">Coleções</h2>
            </div>
            <Link href="/catalog">
              Ver tudo <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="home-collection-grid">
            {collections.map((collection) => (
              <Link className="home-collection-card" href="/catalog" key={collection.number}>
                <span className="home-collection-number">{collection.number}</span>
                <span aria-hidden="true" className="home-collection-flower">
                  <DividerFlower />
                </span>
                <h3>{collection.name}</h3>
                <p>{collection.detail}</p>
                <span className="home-collection-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="how-title" className="home-story">
          <div className="home-story-copy">
            <p className="home-kicker">DA ESCOLHA À RETIRADA</p>
            <h2 id="how-title">Escolha. Reserve. Combine.</h2>
            <p>
              Explore o catálogo, reserve os itens disponíveis e acompanhe seu pedido. O pagamento é
              combinado diretamente com a loja pelo WhatsApp.
            </p>
            <Link href="/catalog">
              Começar pelo catálogo <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div aria-hidden="true" className="home-story-engraving">
            <BotanicalEngraving />
          </div>
        </section>

        <section aria-labelledby="featured-products-title" className="home-bestsellers">
          <div>
            <p className="home-kicker">SELEÇÃO DA CASA</p>
            <h2 id="featured-products-title">Destaques da loja</h2>
          </div>
          {products.length > 0 ? (
            <div className="catalog-grid">
              {products.map((product) => (
                <HomeProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="home-empty" role="status">
              <p>
                {catalogUnavailable
                  ? "O catálogo está temporariamente indisponível."
                  : "Produtos publicados e disponíveis aparecerão aqui."}
              </p>
              <Link href="/catalog">Ver catálogo</Link>
            </div>
          )}
        </section>

        <footer className="home-footer">
          <span>FLOR DA MEIA-NOITE</span>
          <span>Flores e objetos para cultivar beleza.</span>
        </footer>
      </div>
    </main>
  );
}
