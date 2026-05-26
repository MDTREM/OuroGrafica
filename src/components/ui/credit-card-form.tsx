"use client";

import React, { useEffect, useMemo, useState } from "react";

type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

type Props = {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
};

function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

const CreditCardForm = ({
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  maskMiddle = true,
  ring1 = "#15cb98",
  ring2 = "#10a379",
  showSubmit = false,
  onChange,
  onSubmit,
  className = "",
}: Props) => {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<null | "number" | "holder" | "expire" | "cvv">(null);

  const flip = focusField === "cvv";
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity: CardValidity = useMemo(() => {
    const nValidLength = number.length >= 13;
    const numberValid = nValidLength;
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const cvvValid = /^\d{3,4}$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid: numberValid && holderValid && monthValid && yearValid && cvvValid,
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv }, validity);
  }, [number, holder, month, year, cvv, validity, onChange]);

  const displayDigits = useMemo(() => number.slice(0, 16).split(""), [number]);

  const displayedSlots = useMemo(() => {
    const arr: { textTop: string; filed: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let content = "#";
      if (i < displayDigits.length) {
        const d = displayDigits[i];
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? "*" : d;
      }
      arr.push({ textTop: content, filed: i < displayDigits.length });
    }
    return arr;
  }, [displayDigits, maskMiddle]);

  const highlightClass = (() => {
    switch (focusField) {
      case "number": return "highlight__number";
      case "holder": return "highlight__holder";
      case "expire": return "highlight__expire";
      case "cvv": return "highlight__cvv";
      default: return "hidden";
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ number, holder, month, year, cvv }, validity);
  };

  const isVisa = number.startsWith("4");

  return (
    <section className={`ccp ${className}`}>
      <div className="wrap">
        <section id="card" className={`card ${flip ? "flip" : ""}`}>
          <section className="card__front" style={{ ["--ring1" as string]: ring1, ["--ring2" as string]: ring2 }}>
            <div className="card__header">
              <div>Cartão de Crédito</div>
              {isVisa ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="40" className="w-auto h-8 text-white fill-current">
                  <path fill="#FFF" d="M16.5 6h2.7l-2.5 12h-2.7L16.5 6zm-7 0H4.3v.2C8.6 7.3 11.5 10 12.7 13.2l-1.2-6.1c-.2-.9-.8-1.2-1.6-1.2zM22 6h-2.8c-1 0-1.7.6-2.1 1.4L11.4 18h3.6l.7-2h4.4l.4 2H24L22 6zm-5.3 10.4c.5-1.3 2.3-6.3 2.3-6.3l1.3 6.3h-3.6zM9.5 6.2c-.7-.3-1.8-.6-3.1-.6C3 5.6.6 7.4.6 10c0 1.9 1.7 2.9 3 3.5 1.3.6 1.8 1 1.8 1.6 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.2-.2-3.4-.7l-.5-.2-.5 3.1c.8.4 2.4.7 4 .7 3.6 0 6-1.8 6-4.6 0-1.5-.9-2.7-3-3.7-1.4-.7-2.3-1.2-2.3-1.9 0-.7.7-1.3 2.3-1.3 1.3 0 2.2.3 2.9.6l.3.1.5-3z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="40" width="60" viewBox="-96 -98.908 832 593.448">
                  <path fill="#ff5f00" d="M224.833 42.298h190.416v311.005H224.833z" />
                  <path d="M244.446 197.828a197.448 197.448 0 0175.54-155.475 197.777 197.777 0 100 311.004 197.448 197.448 0 01-75.54-155.53z" fill="#eb001b" />
                  <path d="M621.101 320.394v-6.372h2.747v-1.319h-6.537v1.319h2.582v6.373zm12.691 0v-7.69h-1.978l-2.307 5.493-2.308-5.494h-1.977v7.691h1.428v-5.823l2.143 5h1.483l2.143-5v5.823z" fill="#f79e1b" />
                  <path d="M640 197.828a197.777 197.777 0 01-320.015 155.474 197.777 197.777 0 000-311.004A197.777 197.777 0 01640 197.773z" fill="#f79e1b" />
                </svg>
              )}
            </div>

            <div id="card_number" className="card__number" aria-label="Card number">
              {displayedSlots.map((slot, idx) => (
                <span key={idx} className="slot">
                  <span className={`digit ${slot.filed ? "filed" : ""}`}>
                    <span className="row placeholder">#</span>
                    <span className="row value">{slot.textTop}</span>
                  </span>
                </span>
              ))}
            </div>

            <div className="card__footer">
              <div className="card__holder">
                <div className="card__section__title">Nome do Titular</div>
                <div id="card_holder">{holder || "NOME NO CARTÃO"}</div>
              </div>
              <div className="card__expires">
                <div className="card__section__title">Validade</div>
                <span id="card_expires_month">{month || "MM"}</span>/
                <span id="card_expires_year">{year ? year.slice(-2) : "AA"}</span>
              </div>
            </div>
          </section>

          <section className="card__back" style={{ ["--ring1" as string]: ring1, ["--ring2" as string]: ring2 }}>
            <div className="card__hide_line" />
            <div className="card_cvv">
              <span>CVV</span>
              <div id="card_cvv_field" className="card_cvv_field">
                {"*".repeat(cvv.length)}
              </div>
            </div>
          </section>
        </section>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="cc_number">Número do Cartão</label>
            <input
              id="cc_number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={formatNumberSpaces(number)}
              onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
              onFocus={() => setFocusField("number")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.number}
            />
            {!validity.number && number.length >= 13 && (
              <small className="err">Número do cartão inválido</small>
            )}
          </div>

          <div>
            <label htmlFor="cc_holder">Nome no Cartão</label>
            <input
              id="cc_holder"
              type="text"
              autoComplete="cc-name"
              placeholder="NOME COMPLETO"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocusField("holder")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.holder}
            />
          </div>

          <div className="filed__group">
            <div>
              <label>Validade</label>
              <div className="filed__date">
                <select
                  id="expiration_month"
                  value={month || ""}
                  onChange={(e) => setMonth(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.month}
                >
                  <option value="" disabled>Mês</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  id="expiration_year"
                  value={year || ""}
                  onChange={(e) => setYear(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.year}
                >
                  <option value="" disabled>Ano</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cc_cvv">CVV</label>
              <input
                id="cc_cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="***"
                value={cvv}
                onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                onFocus={() => setFocusField("cvv")}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.cvv}
              />
            </div>
          </div>

          {showSubmit && (
            <button className="submit" type="submit" disabled={!validity.allValid} aria-disabled={!validity.allValid}>
              {validity.allValid ? "Confirmar" : "Preencha todos os campos"}
            </button>
          )}
        </form>
      </div>

      <style jsx>{`
        .ccp {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0;
          background: transparent;
          color: #0d0c22;
        }
        .wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        * { box-sizing: border-box; }

        .card {
          position: relative;
          width: 100%;
          max-width: 380px;
          aspect-ratio: 380 / 220;
          transform-style: preserve-3d;
          transition: 0.8s;
          perspective: 1000px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transform: translateZ(0);
          will-change: transform;
        }
        .card.flip { transform: rotateY(180deg); }

        .card__front, .card__back {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          padding: 20px 24px 24px;
          background: linear-gradient(to right bottom, #323941, #061018);
          box-shadow: 0 20px 40px -12px rgba(50, 55, 63, 0.5);
          color: #fff;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: relative;
        }

        .card__header svg {
          height: 36px;
          width: auto;
          display: block;
        }

        @media (max-width: 450px) {
          .card__front, .card__back {
            padding: 14px 18px 18px;
          }
          .card__header {
            margin-bottom: 20px;
          }
          .card__header svg {
            height: 26px;
          }
          .card__number {
            font-size: 16px !important;
            height: 24px !important;
            margin-bottom: 16px !important;
          }
          .card__number .digit {
            height: 24px !important;
            line-height: 24px !important;
          }
          .card__number .digit.filed {
            transform: translateY(-24px) !important;
          }
          .card__number .row {
            height: 24px !important;
          }
          .card__section__title {
            font-size: 10px !important;
          }
          #card_holder, .card__expires {
            font-size: 12px !important;
          }
        }

        .card__back {
          position: absolute;
          top: 0; left: 0;
          transform: rotateY(180deg);
          padding: 24px 0 0;
        }

        .card__front::before, .card__back::before {
          content: "";
          position: absolute;
          border: 16px solid var(--ring1, #15cb98);
          border-radius: 100%;
          left: -17%; top: -45px;
          height: 300px; width: 300px;
          filter: blur(13px);
        }

        .card__front::after, .card__back::after {
          content: "";
          position: absolute;
          border: 16px solid var(--ring2, #10a379);
          border-radius: 100%;
          width: 300px;
          top: 55%; left: -200px;
          height: 300px;
          filter: blur(13px);
        }

        .card__hide_line {
          height: 40px; width: 100%;
          background-color: #6b7280;
          position: relative; z-index: 1;
        }

        .card_cvv {
          position: relative; z-index: 1;
          margin-top: 24px; padding: 0 32px;
          display: flex; flex-direction: column; align-items: end;
          font-size: 14px; font-weight: 600; text-transform: uppercase;
        }
        .card_cvv_field {
          margin-top: 6px;
          background-color: #fff;
          border-radius: 12px;
          height: 44px; width: 100%;
          color: #000;
          display: flex; align-items: center; justify-content: end;
          padding: 0 12px;
          font-size: 25px; line-height: 21px;
        }

        .card__header {
          display: flex; align-items: center; justify-content: space-between;
          font-weight: 600; margin-bottom: 32px;
          position: relative; z-index: 1;
        }

        .card__number {
          font-size: 20px;
          margin-bottom: 24px;
          position: relative; z-index: 1;
          display: flex; height: 30px;
          overflow: hidden; color: #fff;
        }

        .card__number .slot { display: inline-flex; margin-right: 0; }
        .card__number .slot:nth-child(4n) { margin-right: 8px; }

        .card__number .digit {
          display: flex; flex-direction: column;
          height: 30px; line-height: 30px;
          transition: transform 0.2s;
        }
        .card__number .digit.filed { transform: translateY(-30px); }
        .card__number .row { height: 30px; display: block; }

        .card__footer {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1;
        }
        .card__holder { text-transform: uppercase; }
        .card__section__title {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
        }

        .form {
          border-radius: 16px;
          background: #fff;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          display: grid;
          gap: 12px;
          color: #0d0c22;
        }

        label {
          display: block;
          margin: 4px 0 4px;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
        }

        input, select {
          height: 44px;
          display: block; width: 100%;
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          transition: outline 200ms ease, box-shadow 200ms ease;
          border-radius: 12px;
          outline: none;
          background-color: #f9fafb;
          color: #0d0c22;
          font-size: 14px;
        }

        input:focus, select:focus {
          border: 1px solid #15cb98;
          outline: 3px solid rgba(21, 203, 152, 0.15);
          background-color: #fff;
        }

        select { padding: 0 16px; }

        .filed__group {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }

        @media (max-width: 400px) {
          .filed__group { grid-template-columns: 1fr; }
        }

        .filed__date {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .err { color: #b42318; font-size: 12px; margin-top: 4px; }

        .submit {
          margin-top: 8px; height: 44px;
          border: none; border-radius: 12px;
          background: #15cb98; color: #fff;
          font-weight: 600; cursor: pointer;
          transition: background 200ms;
        }
        .submit:hover:not(:disabled) { background: #10a379; }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </section>
  );
};

export { CreditCardForm };
export type { CardState, CardValidity };
